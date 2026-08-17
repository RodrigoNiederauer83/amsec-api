import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../src/api/client";

export default function JoinGroup() {
  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  async function handleJoin() {
    if (!token.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await apiClient.post(`/groups/invite/${token.trim()}/join`);
      await queryClient.invalidateQueries({ queryKey: ["groups"] });
      router.replace(`/(app)/groups/${response.data.groupId}`);
    } catch (error: any) {
      const message = error.response?.data?.error ?? "Código inválido ou expirado.";
      Alert.alert("Erro", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Entrar em um grupo</Text>
      <Text style={styles.subtitle}>Cole o código que você recebeu</Text>

      <TextInput
        style={styles.input}
        placeholder="Código do convite"
        autoCapitalize="none"
        value={token}
        onChangeText={setToken}
      />

      <Pressable style={styles.button} onPress={handleJoin} disabled={isSubmitting}>
        <Text style={styles.buttonText}>{isSubmitting ? "Entrando..." : "Entrar"}</Text>
      </Pressable>

      <Pressable onPress={() => router.back()}>
        <Text style={styles.link}>Cancelar</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "600", color: "#3B0764", textAlign: "center" },
  subtitle: { fontSize: 14, color: "#6B6470", textAlign: "center", marginTop: 8, marginBottom: 24 },
  input: { borderWidth: 1, borderColor: "#F3E8FF", borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: "#7C3AED", borderRadius: 999, padding: 16, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  link: { color: "#7C3AED", textAlign: "center", marginTop: 20 },
});