import { Suspense } from "react";
import BedanktContent from "./BedanktContent";

export default function BedanktPage() {
  return (
    <Suspense fallback={null}>
      <BedanktContent />
    </Suspense>
  );
}