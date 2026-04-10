import AppShell from "@/components/Shell/AppShell";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
