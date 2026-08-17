import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@amsec/shared";
import { z } from "zod";
import { router } from "expo-router";
import { apiClient } from "../../src/api/client";
import { useAuth } from "../../src/auth/AuthContext";

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { signIn } = useAuth();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    try {
      const response = await apiClient.post("/auth/login", data);
      await signIn(response.data.token);
      router.replace("/(app)");
    } catch (error: any) {
      const message = error.response?.data?.error ?? "Erro ao entrar. Tente novamente.";
      Alert.alert("Erro", message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Secretin</Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            autoCapitalize="none"
            keyboardType="email-address"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Senha"
            secureTextEntry
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      <Pressable style={styles.button} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
        <Text style={styles.buttonText}>{isSubmitting ? "Entrando..." : "Entrar"}</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/(auth)/register")}>
        <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 32, fontWeight: "600", color: "#3B0764", textAlign: "center", marginBottom: 32 },
  input: { borderWidth: 1, borderColor: "#F3E8FF", borderRadius: 12, padding: 14, marginBottom: 4, fontSize: 16 },
  error: { color: "#dc2626", fontSize: 12, marginBottom: 12 },
  button: { backgroundColor: "#7C3AED", borderRadius: 999, padding: 16, alignItems: "center", marginTop: 16 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  link: { color: "#7C3AED", textAlign: "center", marginTop: 20 },
});