import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { Card, CardContent } from "~/components/ui/card";

export default function SuccessPayment() {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (countdown === 0) {
            navigate("/");
            return;
        }
        const timer = setTimeout(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);
        return () => clearTimeout(timer);
    }, [countdown, navigate]);

    return (
        <main className="flex items-center justify-center w-full h-screen">
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                    <svg
                        className="w-16 h-16 text-green-500 mb-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                    >
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                        <path
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12l2 2l4-4"
                        />
                    </svg>
                    <h2 className="text-2xl font-semibold mb-2">Pembayaran Berhasil!</h2>
                    <p className="text-gray-600 mb-4">
                        Anda akan diarahkan ke halaman utama dalam {countdown} detik.
                    </p>
                </CardContent>
            </Card>
        </main>
    );
}