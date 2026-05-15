import { useState } from 'react';
import { Send } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const PartnerPage = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    facebook: '',
    instagram: '',
    website: '',
    otherLink: '',
    salesVolume: '',
    email: '',
    phone: '',
    proposal: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName.trim()) {
      toast.error('El nombre de la empresa es obligatorio');
      return;
    }
    if (!formData.facebook.trim() && !formData.instagram.trim() && !formData.website.trim() && !formData.otherLink.trim()) {
      toast.error('Debes llenar al menos una red social o página web');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('El correo de contacto es obligatorio');
      return;
    }
    if (!formData.proposal.trim()) {
      toast.error('Describe tu propuesta de alianza');
      return;
    }

    toast.success('¡Solicitud enviada con éxito! Nos pondremos en contacto contigo pronto.');
    setFormData({
      companyName: '',
      facebook: '',
      instagram: '',
      website: '',
      otherLink: '',
      salesVolume: '',
      email: '',
      phone: '',
      proposal: '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/20">
      <Navbar />

      {/* Header */}
      <section className="pt-28 pb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            🤝 Conviértete en <span className="gradient-text">Aliado</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Únete a nuestra red de socios y expande tu negocio con nosotros. Completa el formulario para iniciar el proceso de alianza.
          </p>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="container mx-auto px-4 pb-16 max-w-3xl space-y-8">
        {/* Company Info Card */}
        <div className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-display font-semibold text-foreground">Información de la Compañía</h2>

          <div className="space-y-2">
            <Label htmlFor="companyName">Nombre de la empresa</Label>
            <Input
              id="companyName"
              placeholder="Nombre de la empresa"
              value={formData.companyName}
              onChange={e => handleChange('companyName', e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Social links */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Redes sociales / Página web</Label>
              <span className="text-xs text-muted-foreground">(Obligatorio: llena al menos 1)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="facebook" className="text-xs text-muted-foreground">Facebook</Label>
                <Input
                  id="facebook"
                  placeholder="https://facebook.com/tu-pagina"
                  value={formData.facebook}
                  onChange={e => handleChange('facebook', e.target.value)}
                  maxLength={255}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="instagram" className="text-xs text-muted-foreground">Instagram</Label>
                <Input
                  id="instagram"
                  placeholder="https://instagram.com/tu-cuenta"
                  value={formData.instagram}
                  onChange={e => handleChange('instagram', e.target.value)}
                  maxLength={255}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="website" className="text-xs text-muted-foreground">Página web</Label>
                <Input
                  id="website"
                  placeholder="https://tuweb.com"
                  value={formData.website}
                  onChange={e => handleChange('website', e.target.value)}
                  maxLength={255}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="otherLink" className="text-xs text-muted-foreground">Otros</Label>
                <Input
                  id="otherLink"
                  placeholder="Link adicional (TikTok, WhatsApp, etc.)"
                  value={formData.otherLink}
                  onChange={e => handleChange('otherLink', e.target.value)}
                  maxLength={255}
                />
              </div>
            </div>
          </div>

          {/* Sales volume */}
          <div className="space-y-2">
            <Label>Volumen de ventas</Label>
            <Select value={formData.salesVolume} onValueChange={v => handleChange('salesVolume', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rango" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-50">0 - 50 ventas/mes</SelectItem>
                <SelectItem value="50-200">50 - 200 ventas/mes</SelectItem>
                <SelectItem value="200-500">200 - 500 ventas/mes</SelectItem>
                <SelectItem value="500+">500+ ventas/mes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo de contacto</Label>
              <Input
                id="email"
                type="email"
                placeholder="Correo de contacto"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono de contacto</Label>
              <Input
                id="phone"
                placeholder="Teléfono (solo dígitos)"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value.replace(/\D/g, ''))}
                maxLength={15}
              />
            </div>
          </div>
        </div>

        {/* Proposal Card */}
        <div className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-4">
          <h2 className="text-xl font-display font-semibold text-foreground">Detalles de la Solicitud</h2>
          <Textarea
            placeholder="Describe tu propuesta de alianza..."
            className="min-h-[140px] resize-y"
            value={formData.proposal}
            onChange={e => handleChange('proposal', e.target.value)}
            maxLength={1000}
          />
        </div>

        {/* Submit */}
        <div className="flex justify-center">
          <button type="submit" className="btn-gaming flex items-center gap-2 px-8 py-3">
            <Send className="h-4 w-4" />
            Enviar Solicitud
          </button>
        </div>
      </form>

      <Footer />
    </div>
  );
};

export default PartnerPage;
