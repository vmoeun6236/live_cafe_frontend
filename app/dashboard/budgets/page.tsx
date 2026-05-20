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
import { Progress } from '@/components/ui/progress';
import { Plus, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import axios from '@/lib/axios';
import { toast } from "react-hot-toast";

interface Budget {
  id: number;
  name: string;
  amount: number;
  period: string;
  start_date: string;
  end_date: string | null;
  category_id: number | null;
  status: string;
  alert_threshold: number;
  spent_amount: number;
  remaining_amount: number;
  usage_percentage: number;
  is_over_budget: boolean;
  is_near_limit: boolean;
  category?: {
    id: number;
    name: string;
  };
}

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    period: 'monthly',
    start_date: '',
    end_date: '',
    category_id: '',
    alert_threshold: '0',
  });

  const fetchBudgets = React.useCallback(async () => {
    try {
      const response = await axios.get('/budgets');
      setBudgets(response.data.data);
    } catch {
      toast.error('Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/budgets', formData);
      toast.success('Budget created successfully');
      setDialogOpen(false);
      setFormData({
        name: '',
        amount: '',
        period: 'monthly',
        start_date: '',
        end_date: '',
        category_id: '',
        alert_threshold: '0',
      });
      fetchBudgets();
    } catch {
      toast.error('Failed to create budget');
    }
  };

  const getStatusBadge = (budget: Budget) => {
    if (budget.is_over_budget) {
      return <Badge variant="destructive">Over Budget</Badge>;
    }
    if (budget.is_near_limit) {
      return <Badge variant="outline">Near Limit</Badge>;
    }
    return <Badge variant="default">On Track</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Budget Management</h1>
          <p className="text-muted-foreground">Track and manage your spending budgets</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
              <DialogDescription>Set up a new budget to track your spending</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Budget Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Monthly Marketing Budget"
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="period">Period</Label>
                <Select value={formData.period} onValueChange={(value) => setFormData({ ...formData, period: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date (Optional)</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="alert_threshold">Alert Threshold</Label>
                <Input
                  id="alert_threshold"
                  type="number"
                  step="0.01"
                  value={formData.alert_threshold}
                  onChange={(e) => setFormData({ ...formData, alert_threshold: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <Button type="submit" className="w-full">Create Budget</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => (
          <Card key={budget.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{budget.name}</CardTitle>
                  <CardDescription>{budget.period} budget</CardDescription>
                </div>
                {getStatusBadge(budget)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Spent</span>
                  <span className="font-semibold">${budget.spent_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-semibold">${budget.remaining_amount.toFixed(2)}</span>
                </div>
                <Progress value={Math.min(budget.usage_percentage, 100)} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{budget.usage_percentage.toFixed(1)}% used</span>
                  <span>${budget.amount.toFixed(2)} total</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Budget: ${budget.amount.toFixed(2)}</span>
              </div>

              {budget.is_over_budget && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Over budget by ${(budget.spent_amount - budget.amount).toFixed(2)}</span>
                </div>
              )}

              {budget.is_near_limit && !budget.is_over_budget && (
                <div className="flex items-center gap-2 text-sm text-yellow-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>Near limit - only ${budget.remaining_amount.toFixed(2)} remaining</span>
                </div>
              )}

              {!budget.is_over_budget && !budget.is_near_limit && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>On track</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {budgets.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">No budgets created yet</p>
            <p className="text-sm text-muted-foreground text-center mt-2">Create your first budget to start tracking spending</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
