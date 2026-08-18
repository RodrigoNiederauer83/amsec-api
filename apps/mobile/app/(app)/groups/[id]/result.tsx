import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, router } from "expo-router";
import { apiClient } from "../../../../src/api/client";

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["assignment", id],
    queryFn: async () => {
      const response = await apiClient.get(`/groups/${id}/assignment`);
      return response.data;
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>‹ Voltar</Text>
      </Pressable>

      <View style={styles.center}>
        {isLoading && <Text>Carregando...</Text>}
        {error && <Text style={styles.error}>Sorteio ainda não disponível.</Text>}
        {data && (
          <>
            <Text style={styles.label}>Você tirou:</Text>
            <Text style={styles.name}>{data.receiver.name}</Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  back: { color: "#7C3AED", marginBottom: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  label: { fontSize: 16, color: "#6B6470" },
  name: { fontSize: 32, fontWeight: "600", color: "#3B0764", marginTop: 8 },
  error: { color: "#dc2626" },
});