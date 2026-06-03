import { MobileOrder } from "@/components/qr-order/mobile-order";

export default function TrackPage({ params }: { params: { tableToken: string } }) {
  return <MobileOrder token={params.tableToken} />;
}
