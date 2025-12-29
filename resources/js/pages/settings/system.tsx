import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react'; // Form helper from Inertia
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Loader2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'System Settings',
        href: '/settings/system',
    },
];

interface Props {
    max_transaction_days: number;
}

export default function SystemSettings({ max_transaction_days }: Props) {
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        max_transaction_days: max_transaction_days.toString(),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch('/settings/system', {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Settings" />

            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">General Setting</h1>
                    <p className="text-muted-foreground mt-1">Manage global system settings</p>
                </div>

                <Card className="max-w-lg">
                    <CardHeader>
                        <CardTitle>Transaction Configuration</CardTitle>
                        <CardDescription>
                            Configure limits for transaction data retrieval.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-2 max-w-xl">
                                <Label htmlFor="max_transaction_days">Max Transaction Fetch Days</Label>
                                <Input
                                    id="max_transaction_days"
                                    type="number"
                                    className="mt-1 block w-full"
                                    value={data.max_transaction_days}
                                    onChange={(e) => setData('max_transaction_days', e.target.value)}
                                    required
                                    min="1"
                                    max="30"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Limit the number of days that can be fetched in a single reconciliation request.
                                </p>
                                <InputError className="mt-2" message={errors.max_transaction_days} />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>

                                {recentlySuccessful && (
                                    <p className="text-sm text-green-600 transition ease-in-out">
                                        Saved
                                    </p>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
