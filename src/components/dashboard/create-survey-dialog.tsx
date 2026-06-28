'use client';

import { useState } from 'react';
import { createSurvey, CampaignActionState } from '@/app/actions/campaign-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';

export default function CreateSurveyDialog({
    tenantId
}: {
    tenantId: string;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState<any[]>([
        { question: '', type: 'TEXT', options: '', order: 0 }
    ]);
    const router = useRouter();

    const addQuestion = () => {
        setQuestions([...questions, { question: '', type: 'TEXT', options: '', order: questions.length }]);
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const handleSubmit = async () => {
        setLoading(true);
        const result = await createSurvey({
            title,
            description,
            tenantId,
            questions
        });
        setLoading(false);

        if (result.success) {
            setOpen(false);
            router.refresh();
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <ClipboardList className="mr-2 h-4 w-4" /> Create Survey
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Survey Builder</DialogTitle>
                    <DialogDescription>
                        Create dynamic feedback forms for your patients.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Survey Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Patient Satisfaction Survey" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell patients why you are collecting feedback..." />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold">Questions</Label>
                            <Button type="button" variant="ghost" size="sm" onClick={addQuestion}>
                                <Plus className="h-4 w-4 mr-2" /> Add Question
                            </Button>
                        </div>

                        {questions.map((q, index) => (
                            <Card key={index} className="relative">
                                <CardContent className="pt-4 space-y-3">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 text-red-500"
                                        onClick={() => removeQuestion(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>

                                    <div className="grid grid-cols-1 gap-2">
                                        <Label>Question Text</Label>
                                        <Input
                                            value={q.question}
                                            onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                                            placeholder="What would you like to ask?"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Type</Label>
                                            <Select
                                                value={q.type}
                                                onValueChange={(val) => updateQuestion(index, 'type', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="TEXT">Text Answer</SelectItem>
                                                    <SelectItem value="RATING">Rating (1-5)</SelectItem>
                                                    <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {q.type === 'MULTIPLE_CHOICE' && (
                                        <div className="space-y-2">
                                            <Label>Options (Comma separated)</Label>
                                            <Input
                                                value={q.options}
                                                onChange={(e) => updateQuestion(index, 'options', e.target.value)}
                                                placeholder="Excellent, Good, Fair, Poor"
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={loading || !title || questions.length === 0}>
                        {loading ? 'Creating...' : 'Activate Survey'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
