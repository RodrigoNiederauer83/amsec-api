import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
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
      {isLoading && <Text>Carregando...</Text>}
      {error && <Text style={styles.error}>Sorteio ainda não disponível.</Text>}
      {data && (
        <>
          <Text style={styles.label}>Você tirou:</Text>
          <Text style={styles.name}>{data.receiver.name}</Text>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", padding: 24 },
  label: { fontSize: 16, color: "#6B6470" },
  name: { fontSize: 32, fontWeight: "600", color: "#3B0764", marginTop: 8 },
  error: { color: "#dc2626" },
});