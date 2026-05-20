'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, CreditCard, CheckCircle, Globe, Lock, QrCode } from 'lucide-react';
import axios from '@/lib/axios';
import { toast } from "react-hot-toast";

interface PaymentGateway {
  id: number;
  name: string;
  provider: string;
  api_key: string;
  api_secret: string;
  environment: string;
  currency: string;
  status: string;
}

export default function PaymentGatewaysPage() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [testing, setTesting] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    provider: 'stripe',
    api_key: '',
    api_secret: '',
    environment: 'sandbox',
    currency: 'USD',
  });

  const fetchGateways = React.useCallback(async () => {
    try {
      const response = await axios.get('/payment-gateways');
      setGateways(response.data.data);
    } catch {
      toast.error('Failed to fetch payment gateways');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGateways();
  }, [fetchGateways]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ensure environment always has a valid value (KHQR doesn't show env field)
      const payload = {
        ...formData,
        environment: formData.environment || 'sandbox',
        currency: formData.currency || 'USD',
      };
      await axios.post('/payment-gateways', payload);
      toast.success('Payment gateway configured successfully');
      setDialogOpen(false);
      setFormData({
        name: '',
        provider: 'stripe',
        api_key: '',
        api_secret: '',
        environment: 'sandbox',
        currency: 'USD',
      });
      fetchGateways();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors
        ? Object.values(err?.response?.data?.errors || {})?.[0] as string
        : 'Failed to configure payment gateway';
      toast.error(msg || 'Failed to configure payment gateway');
    }
  };

  const testConnection = async (gateway: PaymentGateway) => {
    setTesting(gateway.id);
    try {
      const response = await axios.post(`/payment-gateways/${gateway.id}/test`);
      if (response.data.data.connected) {
        toast.success('Connection successful');
      } else {
        toast.error('Connection failed');
      }
    } catch {
      toast.error('Connection test failed');
    } finally {
      setTesting(null);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'stripe':
        return <CreditCard className="h-5 w-5 text-blue-600" />;
      case 'paypal':
        return <Globe className="h-5 w-5 text-yellow-600" />;
      case 'khqr':
        return <QrCode className="h-5 w-5 text-red-600" />;
      default:
        return <Lock className="h-5 w-5" />;
    }
  };

  const getEnvironmentBadge = (environment: string) => {
    return environment === 'production' ? (
      <Badge variant="destructive">Production</Badge>
    ) : (
      <Badge variant="secondary">Sandbox</Badge>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment Gateways</h1>
          <p className="text-muted-foreground">Configure and manage payment providers</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Gateway
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configure Payment Gateway</DialogTitle>
              <DialogDescription>Add a new payment provider to your system</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Gateway Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Stripe Production"
                  required
                />
              </div>
              <div>
                <Label htmlFor="provider">Provider</Label>
                <Select value={formData.provider} onValueChange={(value) => {
                  setFormData({ 
                    ...formData, 
                    provider: value,
                    name: value === 'khqr' ? 'MAKARA HAM (KHQR)' : formData.name,
                    currency: value === 'khqr' ? 'USD' : formData.currency
                  })
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="khqr">KHQR (Bakong / ABA)</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="api_key">
                  {formData.provider === 'khqr' ? 'Account KHR' : 'API Key'}
                </Label>
                <Input
                  id="api_key"
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  placeholder={formData.provider === 'khqr' ? 'e.g., 008656861' : 'Enter API key'}
                  required
                />
              </div>
              <div>
                <Label htmlFor="api_secret">
                  {formData.provider === 'khqr' ? 'Account USD' : 'API Secret'}
                </Label>
                <Input
                  id="api_secret"
                  type={formData.provider === 'khqr' ? 'text' : 'password'}
                  value={formData.api_secret}
                  onChange={(e) => setFormData({ ...formData, api_secret: e.target.value })}
                  placeholder={formData.provider === 'khqr' ? 'e.g., 008656859' : 'Enter API secret'}
                  required
                />
              </div>
              <div>
                <Label htmlFor="environment">Environment</Label>
                <Select value={formData.environment} onValueChange={(value) => setFormData({ ...formData, environment: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">Sandbox</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                    <SelectItem value="AUD">AUD</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Configure Gateway</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {gateways.map((gateway) => (
          <Card key={gateway.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {getProviderIcon(gateway.provider)}
                  <div>
                    <CardTitle className="text-lg">{gateway.name}</CardTitle>
                    <CardDescription className="capitalize">{gateway.provider}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  {getEnvironmentBadge(gateway.environment)}
                  <Badge variant={gateway.status === 'active' ? 'default' : 'secondary'}>
                    {gateway.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Currency</span>
                  <span className="font-semibold">{gateway.currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {gateway.provider === 'khqr' ? 'Account KHR' : 'API Key'}
                  </span>
                  <span className="font-mono text-xs">
                    {gateway.provider === 'khqr' ? gateway.api_key : `${gateway.api_key.substring(0, 8)}...`}
                  </span>
                </div>
                {gateway.provider === 'khqr' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Account USD</span>
                    <span className="font-mono text-xs">{gateway.api_secret}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => testConnection(gateway)}
                  disabled={testing === gateway.id}
                >
                  {testing === gateway.id ? 'Testing...' : 'Test Connection'}
                </Button>
                <Button variant="outline" size="icon">
                  <Lock className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Configured and ready</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {gateways.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">No payment gateways configured</p>
            <p className="text-sm text-muted-foreground text-center mt-2">Add a payment gateway to start accepting payments</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
