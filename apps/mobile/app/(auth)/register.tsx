import { View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@amsec/shared";
import { z } from "zod";
import { router } from "expo-router";
import { apiClient } from "../../src/api/client";
import { useAuth } from "../../src/auth/AuthContext";

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const { signIn } = useAuth();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterForm) {
    try {
      await apiClient.post("/auth/register", data);
      const loginResponse = await apiClient.post("/auth/login", {
        email: data.email,
        password: data.password,
      });
      await signIn(loginResponse.data.token);
      router.replace("/(app)");
    } catch (error: any) {
      const message = error.response?.data?.error ?? "Erro ao cadastrar. Tente novamente.";
      Alert.alert("Erro", message);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Criar conta</Text>

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Nome" value={value} onChangeText={onChange} />
        )}
      />
      {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

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
        name="phoneNumber"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Telefone (ex: +5511999998888)"
            keyboardType="phone-pad"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.phoneNumber && <Text style={styles.error}>{errors.phoneNumber.message}</Text>}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Senha" secureTextEntry value={value} onChangeText={onChange} />
        )}
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      <Pressable style={styles.button} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
        <Text style={styles.buttonText}>{isSubmitting ? "Criando..." : "Criar conta"}</Text>
      </Pressable>

      <Pressable onPress={() => router.back()}>
        <Text style={styles.link}>Já tem conta? Entrar</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "600", color: "#3B0764", textAlign: "center", marginBottom: 24 },
  input: { borderWidth: 1, borderColor: "#F3E8FF", borderRadius: 12, padding: 14, marginBottom: 4, fontSize: 16 },
  error: { color: "#dc2626", fontSize: 12, marginBottom: 12 },
  button: { backgroundColor: "#7C3AED", borderRadius: 999, padding: 16, alignItems: "center", marginTop: 16 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  link: { color: "#7C3AED", textAlign: "center", marginTop: 20 },
});