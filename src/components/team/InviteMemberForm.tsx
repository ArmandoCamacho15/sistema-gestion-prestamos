'use client';

import { useState } from 'react';
import { createInvite } from '@/app/(dashboard)/equipo/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Check, Copy } from 'lucide-react';

export function InviteMemberForm({ ownerId }: { ownerId: string }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('collector');
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInviteLink('');

    const res = await createInvite(ownerId, email, role);

    if (res.error) {
      setError(res.error);
    } else if (res.token) {
      const link = `${window.location.origin}/invite/${res.token}`;
      setInviteLink(link);
      setEmail('');
    }

    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleInvite} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email del empleado</Label>
          <Input 
            id="email" 
            type="email" 
            required 
            placeholder="empleado@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="role">Rol</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="collector">Cobrador</SelectItem>
              <SelectItem value="secretary">Secretaria</SelectItem>
              <SelectItem value="supervisor">Supervisor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Generando...' : 'Generar Invitación'}
        </Button>
      </form>

      {inviteLink && (
        <div className="mt-4 p-4 border rounded-lg bg-muted/50 space-y-2">
          <Label className="text-sm font-medium">Enlace de Invitación generado:</Label>
          <div className="flex items-center gap-2">
            <Input readOnly value={inviteLink} className="text-xs" />
            <Button size="icon" variant="outline" onClick={handleCopy} type="button">
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Copia este enlace y envíaselo a la persona. El enlace expirará en 7 días.
          </p>
        </div>
      )}
    </div>
  );
}
