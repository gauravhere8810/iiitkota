import AppShell from "@/components/Shell/AppShell";

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
