import { useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, Alert, Share, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, router } from "expo-router";
import { apiClient } from "../../../src/api/client";
import { useAuth } from "../../../src/auth/AuthContext";

type Member = { id: number; name: string | null };
type GroupDetail = {
  id: number;
  name: string;
  owner: { id: number; name: string | null };
  members: Member[];
  hasDraw: boolean;
  eventDate: string | null;
};

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showPicker, setShowPicker] = useState(false);

  const { data: group, isLoading } = useQuery({
    queryKey: ["group", id],
    queryFn: async () => {
      const response = await apiClient.get<GroupDetail>(`/groups/${id}`);
      return response.data;
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/groups/${id}/invite`);
      return response.data;
    },
    onSuccess: (data) => {
      Share.share({
        message: `Você foi convidado para o grupo "${group?.name}" no Secretin! Abra o app, toque em "Entrar com código" e cole este código: ${data.token}`,
      });
    },
    onError: () => Alert.alert("Erro", "Não foi possível gerar o convite."),
  });

  const setDateMutation = useMutation({
    mutationFn: async (eventDate: string) => {
      await apiClient.patch(`/groups/${id}/settings`, { eventDate });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
    },
    onError: () => Alert.alert("Erro", "Não foi possível salvar a data."),
  });

  const drawMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/groups/${id}/draw`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      Alert.alert("Sorteio realizado!", "Agora cada participante já pode ver o resultado.");
    },
    onError: (error: any) => {
      Alert.alert("Erro", error.response?.data?.error ?? "Não foi possível realizar o sorteio.");
    },
  });

  function handleDateChange(event: any, selectedDate?: Date) {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();
      const neutralDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
      setDateMutation.mutate(neutralDate.toISOString());
    }
  }

  if (isLoading || !group) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Carregando...</Text>
      </SafeAreaView>
    );
  }

  const isOwner = group.owner.id === user?.id;

  return (
    <SafeAreaView style={styles.container}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>‹ Voltar</Text>
      </Pressable>

      <Text style={styles.title}>{group.name}</Text>
      <Text style={styles.subtitle}>Responsável: {group.owner.name}</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Data do evento</Text>
        <Text style={styles.infoValue}>
          {group.eventDate ? new Date(group.eventDate).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "Não definida"}
        </Text>
        {isOwner && (
          <Pressable onPress={() => setShowPicker(true)}>
            <Text style={styles.link}>{group.eventDate ? "Alterar" : "Definir data"}</Text>
          </Pressable>
        )}
      </View>

      {showPicker && (
        <DateTimePicker
          value={group.eventDate ? new Date(group.eventDate) : new Date()}
          mode="date"
          onValueChange={handleDateChange}
        />
      )}

      {isOwner && (
        <Pressable style={styles.secondaryButton} onPress={() => inviteMutation.mutate()} disabled={inviteMutation.isPending}>
          <Text style={styles.secondaryButtonText}>{inviteMutation.isPending ? "Gerando..." : "Convidar pessoas"}</Text>
        </Pressable>
      )}

      {isOwner && (
        <Pressable
          style={[styles.button, !group.eventDate && styles.buttonDisabled]}
          onPress={() => drawMutation.mutate()}
          disabled={drawMutation.isPending || !group.eventDate || group.members.length < 3}
        >
          <Text style={styles.buttonText}>
            {drawMutation.isPending ? "Sorteando..." : group.hasDraw ? "Refazer sorteio" : "Realizar sorteio"}
          </Text>
        </Pressable>
      )}

      {group.hasDraw && (
        <Pressable style={styles.secondaryButton} onPress={() => router.push(`/(app)/groups/${id}/result`)}>
          <Text style={styles.secondaryButtonText}>Ver meu resultado</Text>
        </Pressable>
      )}

      <Text style={styles.sectionTitle}>Integrantes ({group.members.length})</Text>
      <FlatList
        data={group.members}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.memberRow}>
            <Text style={styles.memberName}>{item.name}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  back: { color: "#7C3AED", marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "600", color: "#3B0764" },
  subtitle: { fontSize: 13, color: "#6B6470", marginTop: 4, marginBottom: 16 },
  infoBox: { backgroundColor: "#F3E8FF", borderRadius: 12, padding: 14, marginBottom: 12 },
  infoLabel: { fontSize: 12, color: "#6B6470" },
  infoValue: { fontSize: 16, fontWeight: "600", color: "#3B0764", marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#3B0764", marginTop: 20, marginBottom: 8 },
  secondaryButton: { backgroundColor: "#F3E8FF", borderRadius: 999, padding: 14, alignItems: "center", marginTop: 12 },
  secondaryButtonText: { color: "#7C3AED", fontWeight: "600" },
  button: { backgroundColor: "#7C3AED", borderRadius: 999, padding: 14, alignItems: "center", marginTop: 12 },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: "#fff", fontWeight: "600" },
  link: { color: "#7C3AED", marginTop: 8, fontWeight: "500" },
  memberRow: { backgroundColor: "#F3E8FF", borderRadius: 12, padding: 12, marginBottom: 8 },
  memberName: { color: "#3B0764", fontWeight: "500" },
});