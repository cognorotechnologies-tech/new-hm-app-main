import Link from "next/link";
import { Button } from "@/components/ui/button"; // Standard shadcn import
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Phone, Clock, Stethoscope, ArrowRight } from "lucide-react";

export default async function TenantLandingPage(props: {
    params: Promise<{ domain: string }>;
}) {
    const params = await props.params;
    const { domain } = params;

    // Fetch Tenant Data with Relations
    const tenant = await prisma.tenant.findUnique({
        where: { slug: domain },
        include: {
            departments: true,
            doctors: {
                include: { user: true },
                take: 6
            }
        }
    });

    if (!tenant) return notFound();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* --- Navigation --- */}
            <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl text-primary">
                        <div className="bg-primary text-primary-foreground p-1 rounded-md">
                            <Stethoscope className="h-6 w-6" />
                        </div>
                        {tenant.name}
                    </div>
                    <nav className="flex gap-4">
                        <Link href={`./login`}>
                            <Button variant="ghost">Staff Login</Button>
                        </Link>
                        <Link href={`./register`}>
                            <Button>Patient Portal</Button>
                        </Link>
                    </nav>
                </div>
            </header>

            {/* --- Hero Section --- */}
            <section className="relative bg-slate-900 py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                <div className="container relative z-10 flex flex-col items-center text-center text-white space-y-6">
                    <Badge variant="secondary" className="px-4 py-1 text-sm uppercase tracking-wider backdrop-blur-sm bg-white/10 text-white border-white/20">
                        World-Class Healthcare
                    </Badge>
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-3xl">
                        Your Health, Our <span className="text-blue-400">Priority</span>
                    </h1>
                    <p className="mx-auto max-w-[700px] text-lg text-slate-300 md:text-xl">
                        Experience advanced medical care with a personal touch at {tenant.name}. Book appointments, view reports, and consult specialists online.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <Link href={`./register`}>
                            <Button size="lg" className="h-12 px-8 text-lg bg-blue-600 hover:bg-blue-700 border-none">
                                Book Appointment <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="#services">
                            <Button size="lg" variant="outline" className="h-12 px-8 text-lg bg-transparent text-white border-white hover:bg-white hover:text-slate-900">
                                View Services
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- Stats Section --- */}
            <section className="bg-white py-12 border-b">
                <div className="container grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div className="space-y-2">
                        <h3 className="text-4xl font-bold text-blue-600">{tenant.doctors.length}+</h3>
                        <p className="text-muted-foreground font-medium">Specialist Doctors</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-4xl font-bold text-blue-600">{tenant.departments.length}</h3>
                        <p className="text-muted-foreground font-medium">Departments</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-4xl font-bold text-blue-600">24/7</h3>
                        <p className="text-muted-foreground font-medium">Emergency Care</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-4xl font-bold text-blue-600">5k+</h3>
                        <p className="text-muted-foreground font-medium">Happy Patients</p>
                    </div>
                </div>
            </section>

            {/* --- Services / Departments --- */}
            <section id="services" className="py-20 container">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Departments</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Comprehensive care across multiple specialities.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tenant.departments.length > 0 ? (
                        tenant.departments.map((dept) => (
                            <Card key={dept.id} className="hover:shadow-lg transition-shadow border-t-4 border-t-primary">
                                <CardHeader>
                                    <div className="mb-4 w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Stethoscope className="h-6 w-6" />
                                    </div>
                                    <CardTitle>{dept.name}</CardTitle>
                                    <CardDescription>{dept.description || "Specialized care unit."}</CardDescription>
                                </CardHeader>
                                <CardFooter>
                                    <Link href={`./register`} className="text-sm font-semibold text-blue-600 hover:underline flex items-center">
                                        Book Consultation <ArrowRight className="ml-1 h-3 w-3" />
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-3 text-center text-muted-foreground">
                            No departments listed yet.
                        </div>
                    )}
                </div>
            </section>

            {/* --- Doctors --- */}
            <section className="py-20 bg-slate-100">
                <div className="container">
                    <div className="flex justify-between items-end mb-12">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Meet Our Specialists</h2>
                            <p className="text-muted-foreground text-lg">
                                Top rated doctors ready to help you.
                            </p>
                        </div>
                        <Link href="./register">
                            <Button variant="outline">View All Doctors</Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tenant.doctors.length > 0 ? (
                            tenant.doctors.map((doc) => (
                                <Card key={doc.id} className="overflow-hidden border-none shadow-none bg-transparent">
                                    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center text-center hover:shadow-md transition-all">
                                        <Avatar className="h-24 w-24 mb-4 ring-4 ring-slate-50">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.user.name}`} />
                                            <AvatarFallback>{doc.user.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <h3 className="font-bold text-xl">{doc.user.name}</h3>
                                        <p className="text-sm text-blue-600 font-medium mb-1">{doc.specialization}</p>
                                        <p className="text-xs text-muted-foreground mb-4">{doc.availability && typeof doc.availability === 'object' && 'hours' in doc.availability ? (doc.availability as any).hours : 'By Appointment'}</p>

                                        <div className="w-full pt-4 border-t mt-auto">
                                            <Link href={`./register`} className="w-full">
                                                <Button className="w-full" variant="secondary">Book Appointment</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-12 text-muted-foreground">
                                No doctors available at the moment.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* --- Footer --- */}
            <footer className="bg-slate-900 text-slate-300 py-12 mt-auto">
                <div className="container grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 font-bold text-xl text-white">
                            <div className="bg-blue-600 text-white p-1 rounded-md">
                                <Stethoscope className="h-5 w-5" />
                            </div>
                            {tenant.name}
                        </div>
                        <p className="text-sm leading-relaxed max-w-xs">
                            Providing quality healthcare with advanced diagnosis and treatment facilities.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Contact</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-blue-500" />
                                123 Health Street, Medical District
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-blue-500" />
                                +1 (555) 123-4567
                            </li>
                            <li className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-500" />
                                Mon - Sun: 24 Hours
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Departments</Link></li>
                            <li><Link href="./login" className="hover:text-white transition-colors">Staff Portal</Link></li>
                            <li><Link href="./register" className="hover:text-white transition-colors">Patient Portal</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="container border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
                    &copy; {new Date().getFullYear()} {tenant.name}. Powered by HealthManager SaaS.
                </div>
            </footer>
        </div>
    );
}
