import AppShell from "@/components/Shell/AppShell";

export default function HierarchyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
