import { ReflectFlowPanel } from "@/components/reflect-flow/ReflectFlowPanel";

// This page serves as the UI for the browser extension popup.
// You can develop and test the popup's appearance and functionality here.
export default function PopupPage() {
  return (
    <main className="w-[400px] h-[600px] bg-background">
      <ReflectFlowPanel />
    </main>
  );
}
