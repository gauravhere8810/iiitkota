import AppShell from "@/components/Shell/AppShell";

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
