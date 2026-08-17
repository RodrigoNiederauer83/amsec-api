import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../src/api/client";

const createGroupSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
});

type CreateGroupForm = z.infer<typeof createGroupSchema>;

export default function CreateGroup() {
  const queryClient = useQueryClient();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateGroupForm>({
    resolver: zodResolver(createGroupSchema),
  });

  async function onSubmit(data: CreateGroupForm) {
    try {
      const response = await apiClient.post("/groups", data);
      await queryClient.invalidateQueries({ queryKey: ["groups"] });
      router.replace(`/(app)/groups/${response.data.id}`);
    } catch (error: any) {
      const message = error.response?.data?.error ?? "Erro ao criar grupo.";
      Alert.alert("Erro", message);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Novo grupo</Text>

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Nome do grupo (ex: Natal 2026)"
            value={value}
            onChangeText={onChange}
            autoFocus
          />
        )}
      />
      {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

      <Pressable style={styles.button} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
        <Text style={styles.buttonText}>{isSubmitting ? "Criando..." : "Criar grupo"}</Text>
      </Pressable>

      <Pressable onPress={() => router.back()}>
        <Text style={styles.link}>Cancelar</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "600", color: "#3B0764", marginBottom: 24, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#F3E8FF", borderRadius: 12, padding: 14, marginBottom: 4, fontSize: 16 },
  error: { color: "#dc2626", fontSize: 12, marginBottom: 12 },
  button: { backgroundColor: "#7C3AED", borderRadius: 999, padding: 16, alignItems: "center", marginTop: 16 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  link: { color: "#7C3AED", textAlign: "center", marginTop: 20 },
});