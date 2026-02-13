import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  useGetSavedPaymentMethods,
  useGetDefaultPaymentMethod,
  useAddPaymentMethod,
  useUpdatePaymentMethod,
  useRemovePaymentMethod,
  useSetDefaultPaymentMethod
} from '@/hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Trash2, Star, Edit2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { PaymentMethod } from '@/backend';

export default function PaymentMethodsPage() {
  const navigate = useNavigate();
  const { data: paymentMethods, isLoading } = useGetSavedPaymentMethods();
  const { data: defaultMethodId } = useGetDefaultPaymentMethod();
  const addPaymentMethod = useAddPaymentMethod();
  const updatePaymentMethod = useUpdatePaymentMethod();
  const removePaymentMethod = useRemovePaymentMethod();
  const setDefaultPaymentMethod = useSetDefaultPaymentMethod();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [deleteMethodId, setDeleteMethodId] = useState<string | null>(null);

  // Form state
  const [nickname, setNickname] = useState('');
  const [brand, setBrand] = useState('');
  const [last4, setLast4] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!nickname.trim()) {
      newErrors.nickname = 'Nickname is required';
    }

    if (!brand) {
      newErrors.brand = 'Card brand is required';
    }

    if (!/^\d{4}$/.test(last4)) {
      newErrors.last4 = 'Last 4 digits must be exactly 4 numbers';
    }

    if (!expiryMonth) {
      newErrors.expiryMonth = 'Expiry month is required';
    }

    if (!expiryYear) {
      newErrors.expiryYear = 'Expiry year is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setNickname('');
    setBrand('');
    setLast4('');
    setExpiryMonth('');
    setExpiryYear('');
    setErrors({});
  };

  const openEditDialog = (method: PaymentMethod) => {
    setEditingMethod(method);
    setNickname(method.nickname);
    setBrand(method.brand);
    setLast4(method.last4);
    const [month, year] = method.expiry.split('/');
    setExpiryMonth(month);
    setExpiryYear(year);
    setErrors({});
  };

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await addPaymentMethod.mutateAsync({
        nickname: nickname.trim(),
        brand,
        last4,
        expiry: `${expiryMonth}/${expiryYear}`
      });

      toast.success('Payment method added successfully');
      resetForm();
      setShowAddForm(false);
    } catch (error: any) {
      toast.error('Failed to add payment method', {
        description: error.message || 'Please try again'
      });
    }
  };

  const handleUpdatePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingMethod || !validateForm()) {
      return;
    }

    try {
      await updatePaymentMethod.mutateAsync({
        id: editingMethod.id,
        input: {
          nickname: nickname.trim(),
          brand,
          last4,
          expiry: `${expiryMonth}/${expiryYear}`
        }
      });

      toast.success('Payment method updated successfully');
      resetForm();
      setEditingMethod(null);
    } catch (error: any) {
      toast.error('Failed to update payment method', {
        description: error.message || 'Please try again'
      });
    }
  };

  const handleRemovePaymentMethod = async () => {
    if (!deleteMethodId) return;

    try {
      await removePaymentMethod.mutateAsync(deleteMethodId);
      toast.success('Payment method removed successfully');
      setDeleteMethodId(null);
    } catch (error: any) {
      toast.error('Failed to remove payment method', {
        description: error.message || 'Please try again'
      });
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      await setDefaultPaymentMethod.mutateAsync(methodId);
      toast.success('Default payment method updated');
    } catch (error: any) {
      toast.error('Failed to set default payment method', {
        description: error.message || 'Please try again'
      });
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear + i);
  const months = [
    { value: '01', label: '01 - January' },
    { value: '02', label: '02 - February' },
    { value: '03', label: '03 - March' },
    { value: '04', label: '04 - April' },
    { value: '05', label: '05 - May' },
    { value: '06', label: '06 - June' },
    { value: '07', label: '07 - July' },
    { value: '08', label: '08 - August' },
    { value: '09', label: '09 - September' },
    { value: '10', label: '10 - October' },
    { value: '11', label: '11 - November' },
    { value: '12', label: '12 - December' }
  ];

  // Sort payment methods: default first
  const sortedPaymentMethods = paymentMethods
    ? [...paymentMethods].sort((a, b) => {
        if (a.id === defaultMethodId) return -1;
        if (b.id === defaultMethodId) return 1;
        return 0;
      })
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading payment methods...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const PaymentMethodForm = ({ onSubmit, isEditing }: { onSubmit: (e: React.FormEvent) => void; isEditing: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nickname">Nickname</Label>
        <Input
          id="nickname"
          placeholder="e.g., Personal Card, Work Card"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        {errors.nickname && (
          <p className="text-sm text-destructive">{errors.nickname}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand">Card Brand</Label>
        <Select value={brand} onValueChange={setBrand}>
          <SelectTrigger id="brand">
            <SelectValue placeholder="Select card brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Visa">Visa</SelectItem>
            <SelectItem value="Mastercard">Mastercard</SelectItem>
            <SelectItem value="American Express">American Express</SelectItem>
            <SelectItem value="Discover">Discover</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.brand && (
          <p className="text-sm text-destructive">{errors.brand}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="last4">Last 4 Digits</Label>
        <Input
          id="last4"
          placeholder="1234"
          maxLength={4}
          value={last4}
          onChange={(e) => setLast4(e.target.value.replace(/\D/g, ''))}
        />
        {errors.last4 && (
          <p className="text-sm text-destructive">{errors.last4}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiryMonth">Expiry Month</Label>
          <Select value={expiryMonth} onValueChange={setExpiryMonth}>
            <SelectTrigger id="expiryMonth">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.expiryMonth && (
            <p className="text-sm text-destructive">{errors.expiryMonth}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiryYear">Expiry Year</Label>
          <Select value={expiryYear} onValueChange={setExpiryYear}>
            <SelectTrigger id="expiryYear">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.expiryYear && (
            <p className="text-sm text-destructive">{errors.expiryYear}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isEditing ? updatePaymentMethod.isPending : addPaymentMethod.isPending}
        >
          {isEditing
            ? updatePaymentMethod.isPending ? 'Updating...' : 'Update Payment Method'
            : addPaymentMethod.isPending ? 'Adding...' : 'Add Payment Method'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (isEditing) {
              setEditingMethod(null);
            } else {
              setShowAddForm(false);
            }
            resetForm();
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/' })}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground mt-2">
            Manage your saved payment methods
          </p>
        </div>

        {/* Add Payment Method Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add Payment Method</CardTitle>
              <CardDescription>
                Add a new payment method to your account. We only store non-sensitive metadata.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentMethodForm onSubmit={handleAddPaymentMethod} isEditing={false} />
            </CardContent>
          </Card>
        )}

        {/* Add Button */}
        {!showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="mb-6"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Payment Method
          </Button>
        )}

        {/* Payment Methods List */}
        {!sortedPaymentMethods || sortedPaymentMethods.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No payment methods</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Add your first payment method to get started with premium features
                </p>
                {!showAddForm && (
                  <Button onClick={() => setShowAddForm(true)} size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Add Payment Method
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedPaymentMethods.map((method) => {
              const isDefault = defaultMethodId === method.id;
              
              return (
                <Card 
                  key={method.id}
                  className={isDefault ? 'border-primary/50 bg-primary/5 shadow-soft' : ''}
                >
                  <CardContent className="py-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${
                          isDefault ? 'bg-primary/20' : 'bg-primary/10'
                        }`}>
                          <CreditCard className={`h-7 w-7 ${isDefault ? 'text-primary' : 'text-primary/70'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{method.nickname}</h3>
                            {isDefault && (
                              <Badge className="gap-1 bg-primary/20 text-primary border-primary/30">
                                <Star className="h-3 w-3 fill-current" />
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground font-medium">
                            {method.brand} •••• {method.last4}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Expires {method.expiry}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(method)}
                          disabled={updatePaymentMethod.isPending}
                          title="Edit payment method"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        {!isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefault(method.id)}
                            disabled={setDefaultPaymentMethod.isPending}
                          >
                            <Star className="h-4 w-4 mr-1.5" />
                            Set as Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteMethodId(method.id)}
                          disabled={removePaymentMethod.isPending}
                          title="Remove payment method"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingMethod} onOpenChange={() => { setEditingMethod(null); resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment Method</DialogTitle>
            <DialogDescription>
              Update the details of your payment method
            </DialogDescription>
          </DialogHeader>
          <PaymentMethodForm onSubmit={handleUpdatePaymentMethod} isEditing={true} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteMethodId} onOpenChange={() => setDeleteMethodId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this payment method? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemovePaymentMethod}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
