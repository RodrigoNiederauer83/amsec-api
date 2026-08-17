import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { apiClient } from "../../src/api/client";
import { useAuth } from "../../src/auth/AuthContext";

type Group = {
  id: number;
  name: string;
  owner: { id: number; name: string | null };
};

export default function GroupsList() {
  const { signOut } = useAuth();

  const { data: groups, isLoading, refetch } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const response = await apiClient.get<Group[]>("/groups");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus grupos</Text>
        <Pressable onPress={signOut}>
          <Text style={styles.logout}>Sair</Text>
        </Pressable>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => String(item.id)}
        onRefresh={refetch}
        refreshing={isLoading}
        contentContainerStyle={groups?.length === 0 && styles.center}
        ListEmptyComponent={<Text style={styles.empty}>Você ainda não faz parte de nenhum grupo.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.groupCard}
            onPress={() => router.push(`/(app)/groups/${item.id}`)}
          >
            <Text style={styles.groupName}>{item.name}</Text>
            <Text style={styles.groupOwner}>Responsável: {item.owner.name}</Text>
          </Pressable>
        )}
      />

      <Pressable style={styles.fab} onPress={() => router.push("/(app)/create-group")}>
        <Text style={styles.fabText}>+ Novo grupo</Text>
      </Pressable>
      <Pressable style={styles.secondaryFab} onPress={() => router.push("/(app)/join-group")}>
        <Text style={styles.secondaryFabText}>Entrar com código</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "600", color: "#3B0764" },
  logout: { color: "#7C3AED" },
  empty: { color: "#6B6470", textAlign: "center" },
  groupCard: { backgroundColor: "#F3E8FF", borderRadius: 16, padding: 16, marginBottom: 12 },
  groupName: { fontSize: 18, fontWeight: "600", color: "#3B0764" },
  groupOwner: { fontSize: 13, color: "#6B6470", marginTop: 4 },
  fab: { backgroundColor: "#7C3AED", borderRadius: 999, padding: 16, alignItems: "center", marginTop: 12 },
  fabText: { color: "#fff", fontWeight: "600" },
  secondaryFab: { backgroundColor: "#F3E8FF", borderRadius: 999, padding: 16, alignItems: "center", marginTop: 12 },
  secondaryFabText: { color: "#7C3AED", fontWeight: "600" },
});