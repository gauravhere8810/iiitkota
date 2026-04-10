import AppShell from "@/components/Shell/AppShell";

export default function MembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
