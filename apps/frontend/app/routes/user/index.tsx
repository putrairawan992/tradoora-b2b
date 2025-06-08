import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter as ShadTableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Package,
  Clock,
  CheckCircle2,
  ShoppingCart,
  SlashIcon,
  AlertCircle,
  Minus, // Tambahkan jika diperlukan untuk +/- qty di keranjang
  Plus,  // Tambahkan jika diperlukan
  X as XIcon,
  ShoppingBag, // Tambahkan jika diperlukan untuk hapus item keranjang
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { trpc } from "~/lib/trpc";
import type { ListByUser as ListTransactionType } from "~/types/transaction"; // Ubah nama agar lebih spesifik
import type { ListCartType } from "~/types/cart"; // Impor tipe keranjang
import { Skeleton } from "~/components/ui/skeleton";
import { useOutletContext, Link } from "react-router"; // Pastikan Link diimpor dari sini
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"; // Impor Avatar

type TransactionItem = ListTransactionType[number];
type CartItemDetail = ListCartType['items'][number]; // Tipe untuk satu item di keranjang
type CartSummary = ListCartType['summary']; // Tipe untuk summary keranjang

const formatCurrency = (amount: string | number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

type OutletContextType = {
  userId: string | undefined;
};

const getStatusBadgeClass = (status: string | null) => {
  status = status?.toUpperCase() || "UNKNOWN";
  switch (status) {
    case "PAID":
    case "SETTLEMENT":
    case "CAPTURE":
      return "bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-400";
    case "PENDING":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-400";
    case "CANCELLED":
    case "EXPIRE":
    case "FAILURE":
    case "DENY":
      return "bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400";
  }
};

export default function DashboardUser() {
  const { userId } = useOutletContext<OutletContextType>();

  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    error: transactionsError,
  } = trpc.transaction.listByUser.useQuery(
    { userId: userId! }, // Menggunakan userId dari context
    {
      enabled: !!userId, // Hanya aktif jika userId ada
    }
  );

  // Fetch data keranjang
  const {
    data: cartData,
    isLoading: isLoadingCart,
    error: cartError,
  } = trpc.cart.list.useQuery(
    undefined, // Tidak memerlukan input, userId diambil dari context di backend
    {
      enabled: !!userId, // Hanya aktif jika user terotentikasi (ada userId)
    }
  );

  const safeTransactions: TransactionItem[] = transactionsData || [];
  const cartItems: CartItemDetail[] = cartData?.items || [];
  const cartSummary: CartSummary | undefined = cartData?.summary;


  const totalAmountCalculated = safeTransactions.reduce((acc, curr) => {
    return acc + Number(curr.price) * curr.qty;
  }, 0);

  const totalOrders = safeTransactions.length;
  const pendingPayments = safeTransactions.filter(
    (inv) => inv.status?.toUpperCase() === "PENDING"
  ).length;
  const successPayments = safeTransactions.filter(
    (inv) =>
      inv.status?.toUpperCase() === "PAID" ||
      inv.status?.toUpperCase() === "SETTLEMENT" ||
      inv.status?.toUpperCase() === "CAPTURE"
  ).length;

  // Handler placeholder untuk aksi di keranjang (perlu implementasi mutasi tRPC)
  const handleRemoveCartItem = (cartItemId: string) => {
    console.log("TODO: Remove cart item", cartItemId);
    alert("Remove item functionality needs tRPC mutation.");
  };

  if (isLoadingTransactions || isLoadingCart) { // Cek kedua loading state
    return (
      <section className="pt-5 container mx-auto mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <SlashIcon />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href="/auth/welcome">Profile User</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="grid grid-cols-1 gap-4 mt-2 md:grid-cols-2 lg:grid-cols-3 md:gap-6 mb-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/3 mb-1" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Separator className="my-4 md:my-6 border-4 rounded-2xl" />
        {/* Skeleton untuk kedua tab jika diperlukan */}
        <Tabs defaultValue="transaction" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:w-[300px] mb-4">
                <TabsTrigger value="transaction">Riwayat Transaksi</TabsTrigger>
                <TabsTrigger value="cart">Keranjang Saya</TabsTrigger>
            </TabsList>
            <TabsContent value="transaction">
                <Card className="shadow-sm mt-4">
                <CardHeader>
                    <Skeleton className="h-7 w-1/4" />
                    <Skeleton className="h-4 w-1/2 mt-1" />
                </CardHeader>
                <CardContent>
                    {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b"><Skeleton className="h-5 w-full" /></div>
                    ))}
                </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="cart">
                <Card className="shadow-sm mt-4">
                <CardHeader>
                    <Skeleton className="h-7 w-1/4" />
                    <Skeleton className="h-4 w-1/2 mt-1" />
                </CardHeader>
                <CardContent>
                    {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b"><Skeleton className="h-5 w-full" /></div>
                    ))}
                </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </section>
    );
  }

  if (transactionsError || cartError) { // Cek kedua error state
    const displayError = transactionsError || cartError;
    return (
      <section className="pt-5 container mx-auto mb-4 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <CardTitle className="mb-2">Gagal Memuat Data</CardTitle>
        <CardDescription>
          Terjadi kesalahan saat mengambil data. Silakan coba
          lagi nanti.
        </CardDescription>
        {displayError && (
            <pre className="mt-4 text-xs bg-red-50 p-2 rounded border border-red-200 text-red-700 max-w-md overflow-auto">
            {displayError.message}
            </pre>
        )}
      </section>
    );
  }

  return (
    <section className="pt-5 container mx-auto mb-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="/auth/welcome">Profile User</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 gap-4 mt-2 md:grid-cols-2 lg:grid-cols-3 md:gap-6 mb-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transaksi
            </CardTitle>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Jumlah semua pesanan yang telah dibuat
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Transaksi Pending
            </CardTitle>
            <Clock className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              Menunggu konfirmasi pembayaran
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Transaksi Berhasil
            </CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successPayments}</div>
            <p className="text-xs text-muted-foreground">
              Pembayaran telah berhasil diterima
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-4 md:my-6 border-4 rounded-2xl" />

      <Tabs defaultValue="transaction" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[300px] mb-4">
          <TabsTrigger value="transaction">Riwayat Transaksi</TabsTrigger>
          <TabsTrigger value="cart">Keranjang Saya</TabsTrigger>
        </TabsList>
        <TabsContent value="transaction">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Daftar Transaksi</CardTitle>
              <CardDescription>
                Berikut adalah daftar semua transaksi Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px] hidden sm:table-cell">
                      Order Id
                    </TableHead>
                    <TableHead>Nama Produk</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="text-right">Jumlah Total</TableHead>
                    <TableHead className="text-center w-[80px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeTransactions.map((transaction: TransactionItem) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium hidden sm:table-cell">
                        {transaction.orderId}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {transaction.product?.name ||
                            "Produk Tidak Ditemukan"}
                        </div>
                        <div className="block sm:hidden text-xs text-muted-foreground">
                          {transaction.orderId}
                        </div>
                        <div className="block md:hidden text-xs capitalize">
                          {transaction.status || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusBadgeClass(
                            transaction.status ?? null
                          )}`}
                        >
                          {transaction.status || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          Number(transaction.price) * transaction.qty
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem>Lihat Detail</DropdownMenuItem>
                            {transaction.status?.toUpperCase() ===
                              "PENDING" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  Lanjutkan Pembayaran
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {safeTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Belum ada transaksi.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                {safeTransactions.length > 0 && (
                  <ShadTableFooter>
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="font-semibold hidden sm:table-cell"
                      >
                        Total Keseluruhan
                      </TableCell>
                      <TableCell
                        colSpan={1}
                        className="font-semibold sm:hidden"
                      >
                        Total
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(totalAmountCalculated)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </ShadTableFooter>
                )}
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cart">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Keranjang Belanja Saya</CardTitle>
              <CardDescription>
                Berikut adalah item yang ada di keranjang belanja Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.length === 0 && !isLoadingCart && (
                <div className="text-center py-10">
                  <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Keranjang belanja Anda kosong.
                  </p>
                   <Link to="/" className="mt-2">
                      <Button variant="link" className="text-amber-600">Mulai Belanja</Button>
                   </Link>
                </div>
              )}
              {cartItems.map((item: CartItemDetail) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg gap-2"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="w-12 h-12 sm:w-16 sm:h-16 rounded-md flex-shrink-0">
                        <AvatarImage src={item.product.imageUrl ?? undefined} alt={item.product.name ?? 'Product'} />
                        <AvatarFallback className="rounded-md">{item.product.name?.charAt(0) || 'P'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" title={item.product.name ?? undefined}>
                        {item.product.name ?? "Nama Produk Tidak Tersedia"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.product.price)} x {item.qty}
                      </p>
                      <p className="text-sm font-semibold">
                        {formatCurrency(Number(item.product.price) * item.qty)}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleRemoveCartItem(item.id)}>
                    <XIcon className="h-4 w-4" />
                    <span className="sr-only">Hapus item</span>
                  </Button>
                </div>
              ))}
            </CardContent>
            {cartItems.length > 0 && (
                <CardFooter className="flex flex-col gap-2 pt-4">
                  <div className="w-full flex justify-between text-sm font-medium">
                      <span>Subtotal</span>
                      <span>{formatCurrency(cartSummary?.totalPrice ?? cartItems.reduce((sum, item) => sum + Number(item.product.price) * item.qty, 0))}</span>
                  </div>
                  <Button asChild className="w-full bg-amber-600 hover:bg-amber-500">
                      <Link to="/checkout">Lanjut ke Checkout ({cartSummary?.totalItems ?? cartItems.length})</Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                      <Link to="/">Lanjut Belanja</Link>
                  </Button>
                </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}