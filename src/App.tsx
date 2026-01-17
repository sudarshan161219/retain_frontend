import { AppRoutes } from "@/routes/AppRoutes";
import { Toaster } from "@/components/ui/sonner";
function App() {
  return (
    <>
      <AppRoutes />

      <Toaster richColors />
    </>
  );
}

export default App;
