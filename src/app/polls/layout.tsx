import AppShell from "@/components/Shell/AppShell";

export default function PollsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
