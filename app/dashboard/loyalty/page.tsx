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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Gift, Star, Award, TrendingUp } from 'lucide-react';
import axios from '@/lib/axios';
import { toast } from "react-hot-toast";

interface LoyaltyProgram {
  id: number;
  name: string;
  points_per_currency: number;
  redemption_rate: number;
  min_points_to_redeem: number;
  expiry_months: number;
  status: string;
  description: string | null;
  loyalty_rewards?: LoyaltyReward[];
}

interface LoyaltyReward {
  id: number;
  name: string;
  description: string | null;
  points_required: number;
  reward_type: string;
  reward_value: number | null;
  status: string;
}

export default function LoyaltyPage() {
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rewardDialogOpen, setRewardDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<LoyaltyProgram | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    points_per_currency: '1.00',
    redemption_rate: '0.01',
    min_points_to_redeem: '100',
    expiry_months: '12',
    description: '',
  });
  const [rewardFormData, setRewardFormData] = useState({
    name: '',
    description: '',
    points_required: '',
    reward_type: 'discount',
    reward_value: '',
  });

  const fetchPrograms = React.useCallback(async () => {
    try {
      const response = await axios.get('/loyalty');
      setPrograms(response.data.data);
    } catch {
      toast.error('Failed to fetch loyalty programs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/loyalty', formData);
      toast.success('Loyalty program created successfully');
      setDialogOpen(false);
      setFormData({
        name: '',
        points_per_currency: '1.00',
        redemption_rate: '0.01',
        min_points_to_redeem: '100',
        expiry_months: '12',
        description: '',
      });
      fetchPrograms();
    } catch {
      toast.error('Failed to create loyalty program');
    }
  };

  const handleRewardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;
    try {
      await axios.post(`/loyalty/${selectedProgram.id}/rewards`, rewardFormData);
      toast.success('Reward added successfully');
      setRewardDialogOpen(false);
      setRewardFormData({
        name: '',
        description: '',
        points_required: '',
        reward_type: 'discount',
        reward_value: '',
      });
      fetchPrograms();
    } catch {
      toast.error('Failed to add reward');
    }
  };

  const getRewardTypeIcon = (type: string) => {
    switch (type) {
      case 'discount':
        return <TrendingUp className="h-4 w-4" />;
      case 'free_item':
        return <Gift className="h-4 w-4" />;
      case 'cashback':
        return <Award className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Loyalty Programs</h1>
          <p className="text-muted-foreground">Manage customer loyalty and rewards</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Program
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Loyalty Program</DialogTitle>
              <DialogDescription>Set up a new loyalty program to reward customers</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Program Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., VIP Rewards"
                  required
                />
              </div>
              <div>
                <Label htmlFor="points_per_currency">Points per Currency Unit</Label>
                <Input
                  id="points_per_currency"
                  type="number"
                  step="0.01"
                  value={formData.points_per_currency}
                  onChange={(e) => setFormData({ ...formData, points_per_currency: e.target.value })}
                  placeholder="1.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="redemption_rate">Redemption Rate</Label>
                <Input
                  id="redemption_rate"
                  type="number"
                  step="0.01"
                  value={formData.redemption_rate}
                  onChange={(e) => setFormData({ ...formData, redemption_rate: e.target.value })}
                  placeholder="0.01"
                  required
                />
              </div>
              <div>
                <Label htmlFor="min_points_to_redeem">Minimum Points to Redeem</Label>
                <Input
                  id="min_points_to_redeem"
                  type="number"
                  value={formData.min_points_to_redeem}
                  onChange={(e) => setFormData({ ...formData, min_points_to_redeem: e.target.value })}
                  placeholder="100"
                  required
                />
              </div>
              <div>
                <Label htmlFor="expiry_months">Points Expiry (Months)</Label>
                <Input
                  id="expiry_months"
                  type="number"
                  value={formData.expiry_months}
                  onChange={(e) => setFormData({ ...formData, expiry_months: e.target.value })}
                  placeholder="12"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Program description"
                />
              </div>
              <Button type="submit" className="w-full">Create Program</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="programs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <Card key={program.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{program.name}</CardTitle>
                      <CardDescription>{program.description || 'No description'}</CardDescription>
                    </div>
                    <Badge variant={program.status === 'active' ? 'default' : 'secondary'}>
                      {program.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{program.points_per_currency} points per $1</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{program.min_points_to_redeem} min points to redeem</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{program.expiry_months} months expiry</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Gift className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{program.loyalty_rewards?.length || 0} rewards available</span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedProgram(program);
                      setRewardDialogOpen(true);
                    }}
                  >
                    Add Reward
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {programs.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Star className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">No loyalty programs created yet</p>
                <p className="text-sm text-muted-foreground text-center mt-2">Create your first program to start rewarding customers</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <div className="grid gap-4">
            {programs.flatMap(program => 
              program.loyalty_rewards?.map(reward => (
                <Card key={reward.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {getRewardTypeIcon(reward.reward_type)}
                        <CardTitle className="text-lg">{reward.name}</CardTitle>
                      </div>
                      <Badge>{reward.points_required} points</Badge>
                    </div>
                    <CardDescription>{reward.description || 'No description'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Program: {program.name}</span>
                      <span>•</span>
                      <span>Type: {reward.reward_type}</span>
                      {reward.reward_value && (
                        <>
                          <span>•</span>
                          <span>Value: ${reward.reward_value.toFixed(2)}</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )) || []
            )}
          </div>

          {programs.flatMap(p => p.loyalty_rewards?.length || 0).reduce((a, b) => a + b, 0) === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Gift className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">No rewards created yet</p>
                <p className="text-sm text-muted-foreground text-center mt-2">Add rewards to your loyalty programs</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Enrollment</CardTitle>
              <CardDescription>Enroll customers in loyalty programs</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="customer">Select Customer</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Customer 1</SelectItem>
                      <SelectItem value="2">Customer 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="program">Select Program</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map(program => (
                        <SelectItem key={program.id} value={program.id.toString()}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" className="w-full">Enroll Customer</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={rewardDialogOpen} onOpenChange={setRewardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Reward to {selectedProgram?.name}</DialogTitle>
            <DialogDescription>Create a new reward for this loyalty program</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRewardSubmit} className="space-y-4">
            <div>
              <Label htmlFor="reward_name">Reward Name</Label>
              <Input
                id="reward_name"
                value={rewardFormData.name}
                onChange={(e) => setRewardFormData({ ...rewardFormData, name: e.target.value })}
                placeholder="e.g., 10% Discount"
                required
              />
            </div>
            <div>
              <Label htmlFor="reward_description">Description</Label>
              <Input
                id="reward_description"
                value={rewardFormData.description}
                onChange={(e) => setRewardFormData({ ...rewardFormData, description: e.target.value })}
                placeholder="Reward description"
              />
            </div>
            <div>
              <Label htmlFor="points_required">Points Required</Label>
              <Input
                id="points_required"
                type="number"
                value={rewardFormData.points_required}
                onChange={(e) => setRewardFormData({ ...rewardFormData, points_required: e.target.value })}
                placeholder="100"
                required
              />
            </div>
            <div>
              <Label htmlFor="reward_type">Reward Type</Label>
              <Select value={rewardFormData.reward_type} onValueChange={(value) => setRewardFormData({ ...rewardFormData, reward_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount">Discount</SelectItem>
                  <SelectItem value="free_item">Free Item</SelectItem>
                  <SelectItem value="cashback">Cashback</SelectItem>
                  <SelectItem value="upgrade">Upgrade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reward_value">Reward Value</Label>
              <Input
                id="reward_value"
                type="number"
                step="0.01"
                value={rewardFormData.reward_value}
                onChange={(e) => setRewardFormData({ ...rewardFormData, reward_value: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <Button type="submit" className="w-full">Add Reward</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
