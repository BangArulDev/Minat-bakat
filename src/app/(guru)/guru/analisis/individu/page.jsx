import { redirect } from "next/navigation";

export default async function IndividuPage({ searchParams }) {
  const params = await searchParams;
  const nis = params?.nis ? `?nis=${params.nis}` : "";
  redirect(`/guru/analisis/hasil-tes${nis}`);
}