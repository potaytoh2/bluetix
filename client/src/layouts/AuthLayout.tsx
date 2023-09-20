import axios from "axios";
import Loading from "components/Suspense/Loading";
import Head from "next/head";
import { useRouter } from "next/router";
import { ReactNode, useEffect } from "react";
import { useAuthStore } from "store/auth";
import { Role, UserInfo } from "store/types";

export default function AuthLayout({
  children,
  title,
  strict, // When set to false, content will still be rendered while fetching user
  permissions = [Role.GUEST], // When user is still being fetched, current role is GUEST. Only display content if permission matches
}: {
  children: (user: UserInfo | null) => ReactNode | ReactNode;
  title: string;
  strict?: boolean;
  permissions?: Role[];
}) {
  const { user, loading, setLoading, loginUser, logoutUser } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    // tentative session persistence function
    const getUser = async () => {
      const endpoint = `http://localhost:9090/api/user`;
      const resp = await axios.get(endpoint);
      if (resp.status === 200) {
        loginUser(resp.data.username);
      } else {
        logoutUser();
        if (strict) router.push("/404");
      }
    };

    if (loading) {
      //   getUser();
    } else if (strict && !user) {
      logoutUser();
      router.push("/404");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user && !permissions.includes(Role.GUEST)) {
      router.push(`/login${router.pathname}`);
    } else if (
      user &&
      !permissions.includes(user.role) &&
      !permissions.includes(Role.GUEST)
    ) {
      router.push("/");
    }
  }, [user]);

  if (strict && !user) return <Loading />;

  if (
    (!user && !permissions.includes(Role.GUEST)) ||
    (user &&
      !permissions.includes(user.role) &&
      !permissions.includes(Role.GUEST))
  ) {
    return <Loading />;
  }
  return (
    <>
      <Head>
        <title>{title ?? "BlueTix"}</title>
        <meta name="description" content="bluetix" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {typeof children === "function" ? children(user) : children}
    </>
  );
}