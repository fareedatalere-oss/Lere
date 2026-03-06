"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  History, 
  UserCircle, 
  MoreVertical, 
  Trash2, 
  ShieldAlert, 
  Eye, 
  ArrowLeft,
  Loader2,
  Search,
  LogOut,
  TrendingUp,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useFirebase, useMemoFirebase, useCollection } from "@/firebase";
import { 
  collection, 
  query, 
  orderBy, 
  deleteDoc, 
  doc, 
  updateDoc,
  where 
} from "firebase/firestore";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const router = useRouter();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [view, setView] = useState<"users" | "transactions" | "profile">("users");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const isAuth = localStorage.getItem("lere_admin_auth");
    if (isAuth !== "true") router.push("/login");
  }, [router]);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "users"), orderBy("createdAt", "desc"));
  }, [firestore]);
  const { data: allUsers, isLoading: loadingUsers } = useCollection(usersQuery);

  const txQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "transactions"), orderBy("createdAt", "desc"));
  }, [firestore]);
  const { data: allTx, isLoading: loadingTx } = useCollection(txQuery);

  const handleAction = async (type: 'delete' | 'block', userId: string, currentStatus?: boolean) => {
    if (!firestore) return;
    try {
      if (type === 'delete') {
        await deleteDoc(doc(firestore, "users", userId));
        toast({ title: "User Deleted", description: "Account removed permanently." });
      } else {
        await updateDoc(doc(firestore, "users", userId), { isBlocked: !currentStatus });
        toast({ title: currentStatus ? "User Unblocked" : "User Blocked" });
      }
    } catch {
      toast({ variant: "destructive", title: "Action Failed" });
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, "transactions", id));
      toast({ title: "Transaction Deleted", description: "Record removed entirely." });
    } catch {
      toast({ variant: "destructive", title: "Error deleting" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("lere_admin_auth");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      <header className="bg-slate-900 text-white p-6 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Manager Center</h1>
              <p className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Master Admin Dashboard</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full hover:bg-white/10">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto w-full p-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Users</p>
              <h2 className="text-2xl font-bold">{allUsers?.length || 0}</h2>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Revenue Flow</p>
              <h2 className="text-2xl font-bold text-primary">₦{(allTx?.reduce((acc, curr) => acc + (curr.total || 0), 0) || 0).toLocaleString()}</h2>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Active Tx</p>
              <h2 className="text-2xl font-bold text-emerald-600">{allTx?.length || 0}</h2>
            </CardContent>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex p-1 bg-slate-200 rounded-2xl">
          <Button variant={view === "users" ? "default" : "ghost"} className="flex-1 rounded-xl h-12" onClick={() => setView("users")}>
            <Users className="h-4 w-4 mr-2" /> Users
          </Button>
          <Button variant={view === "transactions" ? "default" : "ghost"} className="flex-1 rounded-xl h-12" onClick={() => setView("transactions")}>
            <History className="h-4 w-4 mr-2" /> Transactions
          </Button>
          <Button variant={view === "profile" ? "default" : "ghost"} className="flex-1 rounded-xl h-12" onClick={() => setView("profile")}>
            <UserCircle className="h-4 w-4 mr-2" /> Profile
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {view === "users" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Search user by name or phone..." 
                  className="pl-10 h-12 rounded-2xl bg-white border-none shadow-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {loadingUsers ? (
                <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <div className="grid gap-3">
                  {allUsers?.filter(u => u.username.toLowerCase().includes(search.toLowerCase()) || u.phoneNumber.includes(search)).map(u => (
                    <Card key={u.id} className={`border-none shadow-sm ${u.isBlocked ? 'bg-red-50' : 'bg-white'}`}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${u.isBlocked ? 'bg-red-200 text-red-700' : 'bg-primary/10 text-primary'}`}>
                            {u.username[0].toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{u.username} {u.isBlocked && <span className="text-[10px] text-red-600 bg-red-100 px-2 py-0.5 rounded-full ml-2">BLOCKED</span>}</h4>
                            <p className="text-xs text-muted-foreground font-mono">{u.phoneNumber}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full"><MoreVertical className="h-5 w-5" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem onClick={() => toast({ title: `Balance: ₦${u.balance.toLocaleString()}` })}>
                              <Eye className="h-4 w-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-orange-600" onClick={() => handleAction('block', u.id!, u.isBlocked)}>
                              <ShieldAlert className="h-4 w-4 mr-2" /> {u.isBlocked ? "Unblock User" : "Block User"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleAction('delete', u.id!)}>
                              <Trash2 className="h-4 w-4 mr-2" /> Delete Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {view === "transactions" && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-2xl flex items-center gap-3 border border-blue-100">
                <TrendingUp className="h-5 w-5 text-primary" />
                <p className="text-xs text-blue-800 font-medium">Master Record: Users cannot delete these records from your dashboard.</p>
              </div>
              {loadingTx ? (
                <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <div className="grid gap-3">
                  {allTx?.map(tx => (
                    <Card key={tx.id} className="border-none shadow-sm bg-white overflow-hidden">
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.status === "Success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                            {tx.status === "Success" ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{tx.type} <span className="text-[10px] text-muted-foreground font-normal">by {tx.userId?.slice(-4)}</span></p>
                            <p className="text-[10px] text-muted-foreground">{tx.createdAt?.seconds ? new Date(tx.createdAt.seconds * 1000).toLocaleString() : 'Just now'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-bold">₦{tx.total?.toLocaleString()}</p>
                            <p className="text-[9px] text-muted-foreground uppercase">{tx.recipient || 'Service'}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-red-400 hover:text-red-600 rounded-full" onClick={() => deleteTransaction(tx.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {view === "profile" && (
            <Card className="border-none shadow-sm bg-white rounded-3xl p-10 text-center">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                < ShieldAlert className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Manager Mode</h2>
              <p className="text-muted-foreground text-sm mt-2">Authenticated as System Administrator</p>
              <div className="mt-10 grid gap-2">
                <Button className="h-14 rounded-2xl" variant="outline" onClick={() => setView("users")}>Manage Users</Button>
                <Button className="h-14 rounded-2xl" variant="outline" onClick={() => setView("transactions")}>Review Finances</Button>
                <Button className="h-14 rounded-2xl bg-red-500 text-white" onClick={handleLogout}>Log Out</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}