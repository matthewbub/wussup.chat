import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 flex justify-center items-center">
        <SignUp />
      </div>
      <Footer />
    </div>
  );
}
