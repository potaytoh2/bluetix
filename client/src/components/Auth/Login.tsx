import { Button, PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPassword, IconUser } from "@tabler/icons-react";
import axios, { AxiosResponse } from "axios";
import { env } from "env.mjs";
import { useRouter } from "next/router";
import { useAuthStore } from "store/auth";
import { Role } from "store/types";

function Login() {
  const { loginUser } = useAuthStore();
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length > 7
          ? null
          : "Passwords must be at least 8 characters long",
    },
  });
  const handleSubmit = async () => {
    const endpoint = `${env.NEXT_PUBLIC_SERVER_URL}/api/auth/signin`;
    await axios
      .post(endpoint, {
        email: form.values.email,
        password: form.values.password,
      })
      .then((resp: AxiosResponse) => {
        if (resp.status === 200) {
          loginUser({
            email: form.values.email,
            isCreator: true,
            role: Role.ADMIN,
            firstName: resp.data.firstName,
            lastName: resp.data.lastName,
          });
        }
      })
      .catch((e: AxiosResponse) => {
        form.setErrors({ firstName: "ErroR!" });
      });
  };
  return (
    <div className="flex w-full max-w-3xl flex-col items-center">
      <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
      <form
        onSubmit={form.onSubmit(handleSubmit)}
        className="mt-8 flex w-full max-w-md flex-col items-center gap-4"
      >
        <TextInput
          size="md"
          radius="md"
          label="Email"
          labelProps={{ className: "mb-1" }}
          className="w-full"
          icon={<IconUser size={"16"} />}
          placeholder="Email"
          {...form.getInputProps("email")}
        />
        <PasswordInput
          size="md"
          radius="md"
          label="Password"
          labelProps={{ className: "mb-1" }}
          className="w-full"
          icon={<IconPassword size={"16"} />}
          placeholder="Password"
          {...form.getInputProps("password")}
        />
        <Button type="submit" fullWidth className="mt-1">
          Login
        </Button>
      </form>
    </div>
  );
}

export default Login;
