'use client';

import { useEffect, useState } from 'react';
import { getPatientEHRData } from '@/app/actions/clinical-actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, History, FlaskConical, Pill, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

type Props = {
    patientId: string;
    tenantId: string;
};

export function PatientEHRView({ patientId, tenantId }: Props) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const ehrData = await getPatientEHRData(patientId, tenantId);
                setData(ehrData);
            } catch (error) {
                console.error("Failed to load EHR data:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [patientId, tenantId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!data) return <div>Failed to load patient history.</div>;

    const { profile, prescriptions, labOrders, vitals } = data;

    return (
        <Card className="w-full border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    Patient EHR: {profile.user.name}
                </CardTitle>
                <CardDescription>
                    {profile.gender || 'Unknown gender'} • {profile.dob ? `${format(new Date(profile.dob), 'PP')}` : 'No DOB'}
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <Tabs defaultValue="vitals" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-4">
                        <TabsTrigger value="vitals"><Activity className="h-4 w-4 mr-2" />Vitals</TabsTrigger>
                        <TabsTrigger value="history"><History className="h-4 w-4 mr-2" />History</TabsTrigger>
                        <TabsTrigger value="prescriptions"><Pill className="h-4 w-4 mr-2" />Rx</TabsTrigger>
                        <TabsTrigger value="labs"><FlaskConical className="h-4 w-4 mr-2" />Labs</TabsTrigger>
                    </TabsList>

                    <ScrollArea className="h-[400px] pr-4">
                        <TabsContent value="vitals">
                            <div className="space-y-4">
                                {vitals.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">No vitals recorded.</p>
                                ) : (
                                    vitals.map((v: any) => (
                                        <div key={v.id} className="p-3 border rounded-lg bg-slate-50/50 space-y-2">
                                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                                                <span>{format(new Date(v.recordedAt), 'PPp')}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                {v.bloodPressure && <div><span className="font-medium">BP:</span> {v.bloodPressure}</div>}
                                                {v.heartRate && <div><span className="font-medium">HR:</span> {v.heartRate} bpm</div>}
                                                {v.temperature && <div><span className="font-medium">Temp:</span> {v.temperature}°C</div>}
                                                {v.spO2 && <div><span className="font-medium">SpO2:</span> {v.spO2}%</div>}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="history">
                            <div className="p-4 border rounded-lg bg-white">
                                <h4 className="font-semibold text-sm mb-2">Medical History</h4>
                                <div className="text-sm text-slate-600 whitespace-pre-wrap">
                                    {typeof profile?.medicalHistory === 'string'
                                        ? profile.medicalHistory
                                        : JSON.stringify(profile?.medicalHistory, null, 2) || 'No history recorded.'}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="prescriptions">
                            <div className="space-y-4">
                                {prescriptions.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">No past prescriptions.</p>
                                ) : (
                                    prescriptions.map((px: any) => (
                                        <div key={px.id} className="p-3 border rounded-lg bg-white space-y-2 hover:border-primary/50 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <span className="text-xs font-semibold">{format(new Date(px.createdAt), 'PP')}</span>
                                                <Badge variant="outline" className="text-[10px]">Dr. {px.doctor.user.name}</Badge>
                                            </div>
                                            <p className="text-sm font-medium">{px.diagnosis}</p>
                                            <div className="text-[10px] text-muted-foreground truncate">
                                                {px.medications.map((m: any) => m.name).join(', ')}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="labs">
                            <div className="space-y-4">
                                {labOrders.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">No past lab orders.</p>
                                ) : (
                                    labOrders.map((lo: any) => (
                                        <div key={lo.id} className="p-3 border rounded-lg bg-white space-y-1">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-semibold">{format(new Date(lo.createdAt), 'PP')}</span>
                                                <Badge variant={lo.status === 'COMPLETED' ? 'default' : 'secondary'} className="text-[10px]">
                                                    {lo.status}
                                                </Badge>
                                            </div>
                                            {lo.result && <p className="text-xs text-slate-600 line-clamp-2">{lo.result}</p>}
                                        </div>
                                    ))
                                )}
                            </div>
                        </TabsContent>
                    </ScrollArea>
                </Tabs>
            </CardContent>
        </Card>
    );
}
