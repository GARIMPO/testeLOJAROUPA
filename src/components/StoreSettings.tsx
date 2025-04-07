import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Save, Upload, X, User, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define settings interface
interface StoreSettings {
  storeName: string;
  storeNameFont: string;
  storeNameColor: string;
  storeNameSize: string;
  pageTitle: string;
  pageTitleFont: string;
  pageTitleColor: string;
  pageTitleSize: string;
  pageSubtitle: string;
  mapLink: string;
  footerText: string;
  bannerConfig: {
    imageUrl: string;
    title: string;
    subtitle: string;
    showExploreButton: boolean;
    textColor: string;
    buttonColor: string;
  };
  headerLinks: {
    novidades: boolean;
    masculino: boolean;
    feminino: boolean;
    kids: boolean;
    calcados: boolean;
    acessorios: boolean;
    off: boolean;
    customLinks: {
      label: string;
      enabled: boolean;
    }[];
  };
  headerColor: string;
  headerLinkColor: string;
  categoryHighlights: {
    enabled: boolean;
    title: string;
    categories: {
      name: string;
      image: string;
      link: string;
    }[];
  };
  socialMedia: {
    enabled: boolean;
    instagram: {
      enabled: boolean;
      url: string;
    };
    facebook: {
      enabled: boolean;
      url: string;
    };
    whatsapp: {
      enabled: boolean;
      url: string;
    };
    tiktok: {
      enabled: boolean;
      url: string;
    };
    twitter: {
      enabled: boolean;
      url: string;
    };
    website: {
      enabled: boolean;
      url: string;
    };
  };
}

// Default settings
const defaultSettings: StoreSettings = {
  storeName: 'TACO',
  storeNameFont: 'Arial, sans-serif', 
  storeNameColor: '#000000',
  storeNameSize: '24px',
  pageTitle: 'Bem-vindo à TACO',
  pageTitleFont: 'Arial, sans-serif',
  pageTitleColor: '#000000',
  pageTitleSize: '24px',
  pageSubtitle: 'Av. Paulista, 1000 - São Paulo, SP | Tel: (11) 9999-9999',
  mapLink: 'https://maps.google.com/?q=Av.+Paulista,+1000,+São+Paulo',
  footerText: '© 2025 TACO. Todos os direitos reservados.',
  bannerConfig: {
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&auto=format&fit=crop',
    title: 'Nova Coleção 2024',
    subtitle: 'Descubra as últimas tendências em roupas e calçados para todas as estações',
    showExploreButton: true,
    textColor: '#FFFFFF',
    buttonColor: '#EF4444'
  },
  headerLinks: {
    novidades: true,
    masculino: true,
    feminino: true,
    kids: true,
    calcados: true,
    acessorios: true,
    off: true,
    customLinks: []
  },
  headerColor: '#FFFFFF',
  headerLinkColor: '#000000',
  categoryHighlights: {
    enabled: true,
    title: 'Categorias em Destaque',
    categories: [
      { 
        name: "Feminino", 
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop",
        link: "/products/feminino"
      },
      { 
        name: "Masculino", 
        image: "https://images.unsplash.com/photo-1617196035154-1e7e6e28b0db?w=800&auto=format&fit=crop",
        link: "/products/masculino" 
      },
      { 
        name: "Kids", 
        image: "https://images.unsplash.com/photo-1519238359922-989348752efb?w=800&auto=format&fit=crop",
        link: "/products/kids" 
      },
      { 
        name: "Acessórios", 
        image: "https://images.unsplash.com/photo-1625591341337-13156895c604?w=800&auto=format&fit=crop",
        link: "/products/acessórios" 
      }
    ]
  },
  socialMedia: {
    enabled: false,
    instagram: {
      enabled: true,
      url: 'https://instagram.com/tacoficial'
    },
    facebook: {
      enabled: true,
      url: 'https://facebook.com/tacoficial'
    },
    whatsapp: {
      enabled: true,
      url: 'https://wa.me/5521999999999'
    },
    tiktok: {
      enabled: false,
      url: 'https://tiktok.com/@tacoficial'
    },
    twitter: {
      enabled: false,
      url: 'https://twitter.com/tacoficial'
    },
    website: {
      enabled: false,
      url: 'https://taco.com.br'
    }
  }
};

// Helper function for simple deep merging (handles nested objects)
const deepMerge = (target: any, source: any): any => {
  const output = { ...target }; // Start with target's properties
  // Check if both target and source are actual objects (not arrays or null)
  const isObject = (item: any): boolean => item && typeof item === 'object' && !Array.isArray(item);

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      const targetValue = target[key];
      const sourceValue = source[key];

      if (isObject(targetValue) && isObject(sourceValue)) {
        // If both values are objects, recursively merge them
        output[key] = deepMerge(targetValue, sourceValue);
      } else {
        // Otherwise, source value overwrites target value (including primitives, arrays, null)
        output[key] = sourceValue;
      }
    });
  }
  // Add keys from source that are not in target
  Object.keys(source).forEach(key => {
    if (!target.hasOwnProperty(key)) {
       output[key] = source[key];
    }
  });

  return output;
};

// Try to load settings from localStorage on app initialization
const getStoredSettings = (): StoreSettings => {
  let storedSettingsJson: string | null = null;
  if (typeof window !== 'undefined') {
    storedSettingsJson = localStorage.getItem('storeSettings');
  }

  if (storedSettingsJson) {
    try {
      const storedSettings = JSON.parse(storedSettingsJson);
      // Deep merge stored settings OVER the defaults
      // This ensures all default keys are present, and stored values override them
      return deepMerge(defaultSettings, storedSettings) as StoreSettings;
    } catch (e) {
      console.error('Failed to parse stored settings, using defaults.', e);
      // Fallback to defaults if parsing fails
      const copy = JSON.parse(JSON.stringify(defaultSettings)); // Create a copy without type issues
      return copy;
    }
  }
  // Return defaults if nothing is stored
  const copy = JSON.parse(JSON.stringify(defaultSettings)); // Create a copy without type issues
  return copy;
};

const StoreSettings = () => {
  // Initialize with a proper default value with the correct type
  const [settings, setSettings] = useState<StoreSettings>(JSON.parse(JSON.stringify(defaultSettings)));
  const { toast } = useToast();
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>('');

  useEffect(() => {
    // Load settings from localStorage on component mount
    setSettings(getStoredSettings());
  }, []);

  const handleUpdateSettings = () => {
    // Validar URLs das categorias
    const validatedSettings = { ...settings };
    
    // Validar URLs das imagens e links das categorias
    if (validatedSettings.categoryHighlights && validatedSettings.categoryHighlights.categories) {
      validatedSettings.categoryHighlights.categories = validatedSettings.categoryHighlights.categories.map(category => {
        // Tenta corrigir URLs sem protocolo
        let imageUrl = category.image;
        if (imageUrl && !imageUrl.startsWith('data:') && !imageUrl.startsWith('http')) {
          if (imageUrl.startsWith('www.')) {
            imageUrl = 'https://' + imageUrl;
          }
        }
        
        // Tenta corrigir links sem protocolo
        let linkUrl = category.link;
        if (linkUrl && !linkUrl.startsWith('/') && !linkUrl.startsWith('http')) {
          if (linkUrl.startsWith('www.')) {
            linkUrl = 'https://' + linkUrl;
          } else {
            linkUrl = '/' + linkUrl;
          }
        }
        
        return {
          ...category,
          image: imageUrl,
          link: linkUrl
        };
      });
    }
    
    // Save settings to localStorage
    localStorage.setItem('storeSettings', JSON.stringify(validatedSettings));
    
    // Show success message
    toast({
      title: "Configurações salvas",
      description: "As configurações da loja foram atualizadas com sucesso.",
      duration: 3000,
    });
  };

  // Fixed: This was causing the TypeScript error
  const handleChange = (section: keyof StoreSettings, field: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      if (section === 'storeName' || section === 'storeNameFont' || section === 'storeNameColor' || 
          section === 'storeNameSize' || section === 'footerText' || section === 'pageTitle' || 
          section === 'pageTitleFont' || section === 'pageTitleColor' || section === 'pageTitleSize' || 
          section === 'pageSubtitle' || section === 'mapLink') {
        newSettings[section] = value;
      } else {
        newSettings[section] = {
          ...prev[section],
          [field]: value
        };
      }
      return newSettings;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a temporary URL for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (field === 'bannerImage') {
        setBannerImage(file);
        setBannerPreview(reader.result as string);
        handleChange('bannerConfig', 'imageUrl', reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Função para adicionar um novo link personalizado
  const addCustomLink = () => {
    const newCustomLink = {
      label: 'Novo Link',
      enabled: true
    };

    const updatedSettings = { 
      ...settings,
      headerLinks: {
        ...settings.headerLinks,
        customLinks: [...settings.headerLinks.customLinks, newCustomLink]
      }
    };

    setSettings(updatedSettings);
  };

  // Função para atualizar um link personalizado existente
  const updateCustomLink = (index: number, field: 'label' | 'enabled', value: string | boolean) => {
    const updatedLinks = [...settings.headerLinks.customLinks];
    updatedLinks[index] = {
      ...updatedLinks[index],
      [field]: value
    };

    const updatedSettings = {
      ...settings,
      headerLinks: {
        ...settings.headerLinks,
        customLinks: updatedLinks
      }
    };

    setSettings(updatedSettings);
  };

  // Função para remover um link personalizado
  const removeCustomLink = (index: number) => {
    const updatedLinks = [...settings.headerLinks.customLinks];
    updatedLinks.splice(index, 1);

    const updatedSettings = {
      ...settings,
      headerLinks: {
        ...settings.headerLinks,
        customLinks: updatedLinks
      }
    };

    setSettings(updatedSettings);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Configurações da Loja</h2>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="general">
          <AccordionTrigger className="font-semibold">
            Configurações Gerais
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="storeName">Nome da Loja</Label>
                    <Input 
                      id="storeName" 
                      value={settings.storeName}
                      onChange={(e) => setSettings({...settings, storeName: e.target.value})}
                      placeholder="Nome da sua loja"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Este nome aparecerá no cabeçalho do site
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="storeNameFont">Fonte do Nome da Loja</Label>
                      <select
                        id="storeNameFont"
                        value={settings.storeNameFont}
                        onChange={(e) => setSettings({...settings, storeNameFont: e.target.value})}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="'Times New Roman', serif">Times New Roman</option>
                        <option value="'Courier New', monospace">Courier New</option>
                        <option value="'Georgia', serif">Georgia</option>
                        <option value="'Verdana', sans-serif">Verdana</option>
                        <option value="'Tahoma', sans-serif">Tahoma</option>
                        <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                        <option value="'Impact', sans-serif">Impact</option>
                        <option value="'Helvetica', sans-serif">Helvetica</option>
                        <option value="'Segoe UI', sans-serif">Segoe UI</option>
                        <optgroup label="Fontes Cursivas">
                          <option value="'Dancing Script', cursive">Dancing Script</option>
                          <option value="'Great Vibes', cursive">Great Vibes</option>
                          <option value="'Pacifico', cursive">Pacifico</option>
                          <option value="'Satisfy', cursive">Satisfy</option>
                          <option value="'Brush Script MT', cursive">Brush Script MT</option>
                          <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
                        </optgroup>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="storeNameSize">Tamanho do Nome da Loja</Label>
                      <select
                        id="storeNameSize"
                        value={settings.storeNameSize}
                        onChange={(e) => setSettings({...settings, storeNameSize: e.target.value})}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="16px">Pequeno (16px)</option>
                        <option value="20px">Médio (20px)</option>
                        <option value="24px">Grande (24px)</option>
                        <option value="28px">Maior (28px)</option>
                        <option value="32px">Extra grande (32px)</option>
                        <option value="36px">Enorme (36px)</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="storeNameColor">Cor do Nome da Loja</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          id="storeNameColor"
                          value={settings.storeNameColor}
                          onChange={(e) => setSettings({...settings, storeNameColor: e.target.value})}
                          className="w-10 h-10 rounded border"
                        />
                      <Input 
                          value={settings.storeNameColor}
                          onChange={(e) => setSettings({...settings, storeNameColor: e.target.value})}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">Pré-visualização do Cabeçalho:</div>
                    </div>
                    <div 
                      className="mt-2 p-2 rounded flex items-center justify-between" 
                      style={{ backgroundColor: settings.headerColor }}
                    >
                      <div className="font-bold" style={{ 
                        color: settings.storeNameColor,
                        fontFamily: settings.storeNameFont,
                        fontSize: settings.storeNameSize
                      }}>
                        {settings.storeName || 'TACO'}
                      </div>
                      <div className="flex items-center space-x-3">
                        <div style={{ color: settings.headerLinkColor }}>Link</div>
                        <div style={{ color: settings.headerLinkColor }}>
                          <User size={20} />
                        </div>
                        <div style={{ color: settings.headerLinkColor }}>
                          <ShoppingCart size={20} />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-md font-semibold mb-4">Cores do Cabeçalho</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="headerColor">Cor de Fundo do Cabeçalho</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <input
                            type="color"
                            id="headerColor"
                            value={settings.headerColor}
                            onChange={(e) => setSettings({...settings, headerColor: e.target.value})}
                            className="w-10 h-10 rounded border"
                          />
                          <Input
                            value={settings.headerColor}
                            onChange={(e) => setSettings({...settings, headerColor: e.target.value})}
                            className="flex-1"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Esta cor será aplicada ao fundo do cabeçalho do site
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="headerLinkColor">Cor dos Links do Cabeçalho</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <input
                            type="color"
                            id="headerLinkColor"
                            value={settings.headerLinkColor}
                            onChange={(e) => setSettings({...settings, headerLinkColor: e.target.value})}
                            className="w-10 h-10 rounded border"
                          />
                          <Input
                            value={settings.headerLinkColor}
                            onChange={(e) => setSettings({...settings, headerLinkColor: e.target.value})}
                            className="flex-1"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Esta cor será aplicada aos links de navegação e ícones (entrar, carrinho)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <Label htmlFor="footerText">Texto do Rodapé</Label>
                    <Textarea
                      id="footerText" 
                      value={settings.footerText}
                      onChange={(e) => setSettings({...settings, footerText: e.target.value})}
                      placeholder="Texto de direitos autorais ou informações da loja"
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="welcomeMessage">
          <AccordionTrigger className="font-semibold">
            Mensagem de Boas-vindas
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="pageTitle">Título da Mensagem de Boas-vindas</Label>
                    <Input 
                      id="pageTitle" 
                      value={settings.pageTitle}
                      onChange={(e) => setSettings({...settings, pageTitle: e.target.value})}
                      placeholder="Bem-vindo à Nossa Loja"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Este título aparecerá no topo da página inicial
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="pageTitleFont">Fonte do Título</Label>
                      <select
                        id="pageTitleFont"
                        value={settings.pageTitleFont}
                        onChange={(e) => setSettings({...settings, pageTitleFont: e.target.value})}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="'Times New Roman', serif">Times New Roman</option>
                        <option value="'Georgia', serif">Georgia</option>
                        <option value="'Verdana', sans-serif">Verdana</option>
                        <option value="'Helvetica', sans-serif">Helvetica</option>
                        <option value="'Segoe UI', sans-serif">Segoe UI</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="pageTitleSize">Tamanho do Título</Label>
                      <select
                        id="pageTitleSize"
                        value={settings.pageTitleSize}
                        onChange={(e) => setSettings({...settings, pageTitleSize: e.target.value})}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="18px">Pequeno (18px)</option>
                        <option value="24px">Médio (24px)</option>
                        <option value="32px">Grande (32px)</option>
                        <option value="36px">Maior (36px)</option>
                        <option value="42px">Extra grande (42px)</option>
                        <option value="48px">Enorme (48px)</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="pageTitleColor">Cor do Título</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          id="pageTitleColor"
                          value={settings.pageTitleColor}
                          onChange={(e) => setSettings({...settings, pageTitleColor: e.target.value})}
                          className="w-10 h-10 rounded border"
                        />
                        <Input 
                          value={settings.pageTitleColor}
                          onChange={(e) => setSettings({...settings, pageTitleColor: e.target.value})}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="pageSubtitle">Informações de Contato e Endereço</Label>
                    <Textarea
                      id="pageSubtitle" 
                      value={settings.pageSubtitle}
                      onChange={(e) => setSettings({...settings, pageSubtitle: e.target.value})}
                      placeholder="Rua Exemplo, 123 - Cidade, UF | Tel: (00) 0000-0000"
                      rows={2}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Estas informações aparecerão na página inicial abaixo do título
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="mapLink">Link do Mapa</Label>
                    <Input 
                      id="mapLink" 
                      value={settings.mapLink}
                      onChange={(e) => setSettings({...settings, mapLink: e.target.value})}
                      placeholder="https://maps.google.com/?q=Endereço"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Este link será usado no botão "Ver mapa" na página inicial
                    </p>
                  </div>

                  <div className="bg-gray-100 rounded-md p-4 mt-4">
                    <h4 className="text-sm font-medium mb-2">Pré-visualização:</h4>
                    <div className="p-4 bg-white rounded-md border">
                      <h2 className="text-xl font-bold" style={{ 
                        fontFamily: settings.pageTitleFont, 
                        color: settings.pageTitleColor,
                        fontSize: settings.pageTitleSize
                      }}>
                        {settings.pageTitle}
                      </h2>
                      <p className="mt-2 text-sm text-gray-600">
                        {settings.pageSubtitle}
                      </p>
                      <div className="mt-2">
                        <button className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                          Ver mapa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="banner">
          <AccordionTrigger className="font-semibold">
            Banner da Página Inicial
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bannerImage">Imagem do Banner</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input 
                        id="bannerImage" 
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'bannerImage')}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('bannerImage')?.click()}
                      >
                        <Upload size={16} className="mr-2" />
                        Escolher Arquivo
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bannerTitle">Título do Banner</Label>
                    <Input 
                      id="bannerTitle" 
                      value={settings.bannerConfig.title}
                      onChange={(e) => handleChange('bannerConfig', 'title', e.target.value)}
                      placeholder="Nova Coleção 2024"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bannerSubtitle">Subtítulo do Banner</Label>
                    <Textarea 
                      id="bannerSubtitle" 
                      value={settings.bannerConfig.subtitle}
                      onChange={(e) => handleChange('bannerConfig', 'subtitle', e.target.value)}
                      placeholder="Descrição do banner"
                      rows={2}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="showExploreButton" 
                      checked={settings.bannerConfig.showExploreButton}
                      onCheckedChange={(checked) => 
                        handleChange('bannerConfig', 'showExploreButton', !!checked)
                      }
                    />
                    <label 
                      htmlFor="showExploreButton" 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Mostrar botão "Novidades"
                    </label>
                  </div>
                  
                  <div>
                    <Label htmlFor="bannerTextColor">Cor do Texto do Banner</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        id="bannerTextColor"
                        value={settings.bannerConfig.textColor}
                        onChange={(e) => handleChange('bannerConfig', 'textColor', e.target.value)}
                        className="h-10 w-16 rounded-md border border-input"
                      />
                      <Input 
                        value={settings.bannerConfig.textColor}
                        onChange={(e) => handleChange('bannerConfig', 'textColor', e.target.value)}
                        placeholder="#FFFFFF"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Cor do título e subtítulo do banner
                    </p>
                  </div>

                  {settings.bannerConfig.showExploreButton && (
                    <div>
                      <Label htmlFor="bannerButtonColor">Cor do Botão do Banner</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          id="bannerButtonColor"
                          value={settings.bannerConfig.buttonColor}
                          onChange={(e) => handleChange('bannerConfig', 'buttonColor', e.target.value)}
                          className="h-10 w-16 rounded-md border border-input"
                        />
                        <Input 
                          value={settings.bannerConfig.buttonColor}
                          onChange={(e) => handleChange('bannerConfig', 'buttonColor', e.target.value)}
                          placeholder="#EF4444"
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Cor de fundo do botão "Novidades"
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-gray-100 rounded-md p-4 mt-2">
                    <p className="text-sm text-gray-600">
                      Prévia (como aparecerá no site):
                    </p>
                    <div className="relative h-40 mt-2 overflow-hidden rounded-md">
                      <img 
                        src={bannerPreview || settings.bannerConfig.imageUrl} 
                        alt="Preview do banner" 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/10"></div>
                      <div className="absolute inset-0 flex flex-col items-start justify-center p-4">
                        <h3 
                          className="text-lg font-bold" 
                          style={{ color: settings.bannerConfig.textColor }}
                        >
                          {settings.bannerConfig.title}
                        </h3>
                        <p 
                          className="text-xs max-w-xs" 
                          style={{ color: settings.bannerConfig.textColor }}
                        >
                          {settings.bannerConfig.subtitle}
                        </p>
                        {settings.bannerConfig.showExploreButton && (
                          <div className="mt-2">
                            <span 
                              className="text-xs text-white px-2 py-1 rounded"
                              style={{ 
                                backgroundColor: settings.bannerConfig.buttonColor,
                                color: '#FFFFFF'
                              }}
                            >
                              Novidades
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="categoryHighlights">
          <AccordionTrigger className="font-semibold">
            Categorias em Destaque
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="categoryHighlights-enabled" 
                      checked={settings.categoryHighlights.enabled}
                      onCheckedChange={(checked) => 
                        handleChange('categoryHighlights', 'enabled', !!checked)
                      }
                    />
                    <label 
                      htmlFor="categoryHighlights-enabled" 
                      className="text-sm font-medium leading-none"
                    >
                      Exibir seção "Categorias em Destaque" na página inicial
                    </label>
                  </div>
                  
                  {settings.categoryHighlights.enabled && (
                    <>
                      <div>
                        <Label htmlFor="categoryTitle">Título da Seção</Label>
                        <Input 
                          id="categoryTitle" 
                          value={settings.categoryHighlights.title}
                          onChange={(e) => handleChange('categoryHighlights', 'title', e.target.value)}
                          placeholder="Categorias em Destaque"
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Banners de Categorias</h3>
                        <p className="text-xs text-gray-500">
                          Configure as categorias que serão exibidas em destaque na página inicial.
                          Cada categoria precisa ter um nome, uma imagem e um link.
                        </p>
                        
                        {settings.categoryHighlights.categories.map((category, index) => (
                          <Card key={index} className="p-4 overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                              {/* Left column - Preview */}
                              <div className="md:col-span-2 order-2 md:order-1">
                                <div className="bg-gray-50 rounded-lg overflow-hidden shadow-sm">
                                  <div className="relative aspect-[3/2] overflow-hidden rounded-md">
                                    {category.image ? (
                                      <img 
                                        src={category.image} 
                                        alt={category.name} 
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex items-center justify-center h-full bg-gray-100">
                                        <p className="text-gray-400">Sem imagem</p>
                                      </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 flex items-center justify-center">
                                      <h3 className="text-white font-semibold text-xl px-4 text-center">
                                        {category.name || 'Nome da Categoria'}
                                      </h3>
                                    </div>
                                  </div>
                                  <div className="p-2 text-center bg-gray-100">
                                    <span className="text-xs text-gray-500">Prévia do banner</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Right column - Settings */}
                              <div className="md:col-span-3 space-y-4 order-1 md:order-2">
                                <div className="flex justify-between items-center">
                                  <h4 className="font-medium">Categoria {index + 1}</h4>
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                      const newCategories = [...settings.categoryHighlights.categories];
                                      newCategories.splice(index, 1);
                                      handleChange('categoryHighlights', 'categories', newCategories);
                                    }}
                                  >
                                    Remover
                                  </Button>
                                </div>
                                
                                <div>
                                  <Label htmlFor={`category-${index}-name`} className="font-medium">Nome da Categoria</Label>
                                  <Input 
                                    id={`category-${index}-name`} 
                                    value={category.name}
                                    onChange={(e) => {
                                      const newCategories = [...settings.categoryHighlights.categories];
                                      const newName = e.target.value;
                                      newCategories[index].name = newName;
                                      
                                      // Automatically update the link based on the category name
                                      if (newName) {
                                        // Convert category name to lowercase, normalize accents and replace spaces with hyphens
                                        const normalizedName = newName
                                          .toLowerCase()
                                          .normalize("NFD")
                                          .replace(/[\u0300-\u036f]/g, "")
                                          .replace(/\s+/g, "-");
                                        
                                        newCategories[index].link = `/products/${normalizedName}`;
                                      }
                                      
                                      handleChange('categoryHighlights', 'categories', newCategories);
                                    }}
                                    placeholder="Ex: Feminino"
                                  />
                                </div>
                                
                                {/* Hidden link field - still saved but not shown in UI */}
                                <input 
                                  type="hidden"
                                  id={`category-${index}-link`} 
                                  value={category.link}
                                  onChange={(e) => {
                                    const newCategories = [...settings.categoryHighlights.categories];
                                    newCategories[index].link = e.target.value;
                                    handleChange('categoryHighlights', 'categories', newCategories);
                                  }}
                                />
                                
                                <div>
                                  <Label htmlFor={`category-${index}-image`} className="font-medium">Imagem da Categoria</Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Input 
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      id={`category-${index}-image-upload`}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          const newCategories = [...settings.categoryHighlights.categories];
                                          newCategories[index].image = reader.result as string;
                                          handleChange('categoryHighlights', 'categories', newCategories);
                                        };
                                        reader.readAsDataURL(file);
                                      }}
                                    />
                                    <Button 
                                      type="button" 
                                      variant="outline"
                                      className="w-full"
                                      onClick={() => document.getElementById(`category-${index}-image-upload`)?.click()}
                                    >
                                      <Upload size={16} className="mr-2" />
                                      Escolher Imagem
                                    </Button>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Para melhor visualização, utilize imagens na proporção 3:2
                                  </p>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                      
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full mt-4"
                        onClick={() => {
                          const newCategories = [...settings.categoryHighlights.categories];
                          const newName = "Nova Categoria";
                          
                          // Create normalized link from the default name
                          const normalizedName = newName
                            .toLowerCase()
                            .normalize("NFD")
                            .replace(/[\u0300-\u036f]/g, "")
                            .replace(/\s+/g, "-");
                            
                          newCategories.push({ 
                            name: newName, 
                            image: "", 
                            link: `/products/${normalizedName}` // Automatically create proper link format
                          });
                          handleChange('categoryHighlights', 'categories', newCategories);
                        }}
                      >
                        + Adicionar Nova Categoria
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="navigation">
          <AccordionTrigger className="font-semibold">
            Links do Cabeçalho
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-4">
                  Selecione quais links devem aparecer no menu de navegação:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="showNovidades" 
                      checked={settings.headerLinks.novidades}
                      onCheckedChange={(checked) => 
                        handleChange('headerLinks', 'novidades', !!checked)
                      }
                    />
                    <label htmlFor="showNovidades" className="text-sm">Novidades</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="showMasculino" 
                      checked={settings.headerLinks.masculino}
                      onCheckedChange={(checked) => 
                        handleChange('headerLinks', 'masculino', !!checked)
                      }
                    />
                    <label htmlFor="showMasculino" className="text-sm">Masculino</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="showFeminino" 
                      checked={settings.headerLinks.feminino}
                      onCheckedChange={(checked) => 
                        handleChange('headerLinks', 'feminino', !!checked)
                      }
                    />
                    <label htmlFor="showFeminino" className="text-sm">Feminino</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="showKids" 
                      checked={settings.headerLinks.kids}
                      onCheckedChange={(checked) => 
                        handleChange('headerLinks', 'kids', !!checked)
                      }
                    />
                    <label htmlFor="showKids" className="text-sm">Kids</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="showCalcados" 
                      checked={settings.headerLinks.calcados}
                      onCheckedChange={(checked) => 
                        handleChange('headerLinks', 'calcados', !!checked)
                      }
                    />
                    <label htmlFor="showCalcados" className="text-sm">Calçados</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="showAcessorios" 
                      checked={settings.headerLinks.acessorios}
                      onCheckedChange={(checked) => 
                        handleChange('headerLinks', 'acessorios', !!checked)
                      }
                    />
                    <label htmlFor="showAcessorios" className="text-sm">Acessórios</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="showOff" 
                      checked={settings.headerLinks.off}
                      onCheckedChange={(checked) => 
                        handleChange('headerLinks', 'off', !!checked)
                      }
                    />
                    <label htmlFor="showOff" className="text-sm">OFF</label>
                  </div>
                  
                  <div className="mt-6 border-t pt-4">
                    <h3 className="text-sm font-medium mb-3">Links Personalizados</h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Adicione links personalizados que aparecerão no menu de navegação.
                      Os links serão formatados como "/products/nome-do-link".
                    </p>
                    
                    {settings.headerLinks.customLinks.map((link, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-3">
                        <Checkbox 
                          checked={link.enabled}
                          onCheckedChange={(checked) => 
                            updateCustomLink(index, 'enabled', !!checked)
                          }
                        />
                        <Input 
                          value={link.label}
                          onChange={(e) => updateCustomLink(index, 'label', e.target.value)}
                          placeholder="Nome do link"
                          className="h-8 text-sm flex-1"
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeCustomLink(index)}
                          className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50 p-0 px-2"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addCustomLink}
                      className="w-full mt-2"
                    >
                      + Adicionar Novo Link
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="socialMedia">
          <AccordionTrigger className="font-semibold">
            Redes Sociais
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="socialMedia-enabled" 
                      checked={settings.socialMedia.enabled}
                      onCheckedChange={(checked) => 
                        handleChange('socialMedia', 'enabled', !!checked)
                      }
                    />
                    <label 
                      htmlFor="socialMedia-enabled" 
                      className="text-sm font-medium leading-none"
                    >
                      Exibir seção "Nossas redes sociais" no rodapé
                    </label>
                  </div>
                  
                  {settings.socialMedia.enabled && (
                    <div className="space-y-6 mt-4">
                      {/* Instagram */}
                      <div className="space-y-2 border-b pb-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="instagram-enabled" 
                            checked={settings.socialMedia.instagram.enabled}
                            onCheckedChange={(checked) => 
                              handleChange('socialMedia', 'instagram', {
                                ...settings.socialMedia.instagram,
                                enabled: !!checked
                              })
                            }
                          />
                          <label 
                            htmlFor="instagram-enabled" 
                            className="text-sm font-medium leading-none"
                          >
                            Instagram
                          </label>
                        </div>
                        
                        {settings.socialMedia.instagram.enabled && (
                          <div className="pt-2">
                            <Label htmlFor="instagram-url">URL do Instagram</Label>
                            <Input 
                              id="instagram-url" 
                              value={settings.socialMedia.instagram.url}
                              onChange={(e) => handleChange('socialMedia', 'instagram', {
                                ...settings.socialMedia.instagram,
                                url: e.target.value
                              })}
                              placeholder="https://instagram.com/suaconta"
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Facebook */}
                      <div className="space-y-2 border-b pb-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="facebook-enabled" 
                            checked={settings.socialMedia.facebook.enabled}
                            onCheckedChange={(checked) => 
                              handleChange('socialMedia', 'facebook', {
                                ...settings.socialMedia.facebook,
                                enabled: !!checked
                              })
                            }
                          />
                          <label 
                            htmlFor="facebook-enabled" 
                            className="text-sm font-medium leading-none"
                          >
                            Facebook
                          </label>
                        </div>
                        
                        {settings.socialMedia.facebook.enabled && (
                          <div className="pt-2">
                            <Label htmlFor="facebook-url">URL do Facebook</Label>
                            <Input 
                              id="facebook-url" 
                              value={settings.socialMedia.facebook.url}
                              onChange={(e) => handleChange('socialMedia', 'facebook', {
                                ...settings.socialMedia.facebook,
                                url: e.target.value
                              })}
                              placeholder="https://facebook.com/suapagina"
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* WhatsApp */}
                      <div className="space-y-2 border-b pb-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="whatsapp-enabled" 
                            checked={settings.socialMedia.whatsapp.enabled}
                            onCheckedChange={(checked) => 
                              handleChange('socialMedia', 'whatsapp', {
                                ...settings.socialMedia.whatsapp,
                                enabled: !!checked
                              })
                            }
                          />
                          <label 
                            htmlFor="whatsapp-enabled" 
                            className="text-sm font-medium leading-none"
                          >
                            WhatsApp
                          </label>
                        </div>
                        
                        {settings.socialMedia.whatsapp.enabled && (
                          <div className="pt-2">
                            <Label htmlFor="whatsapp-url">URL do WhatsApp</Label>
                            <Input 
                              id="whatsapp-url" 
                              value={settings.socialMedia.whatsapp.url}
                              onChange={(e) => handleChange('socialMedia', 'whatsapp', {
                                ...settings.socialMedia.whatsapp,
                                url: e.target.value
                              })}
                              placeholder="https://wa.me/55999999999"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Formato recomendado: https://wa.me/55999999999 (com código do país)
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* TikTok */}
                      <div className="space-y-2 border-b pb-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="tiktok-enabled" 
                            checked={settings.socialMedia.tiktok.enabled}
                            onCheckedChange={(checked) => 
                              handleChange('socialMedia', 'tiktok', {
                                ...settings.socialMedia.tiktok,
                                enabled: !!checked
                              })
                            }
                          />
                          <label 
                            htmlFor="tiktok-enabled" 
                            className="text-sm font-medium leading-none"
                          >
                            TikTok
                          </label>
                        </div>
                        
                        {settings.socialMedia.tiktok.enabled && (
                          <div className="pt-2">
                            <Label htmlFor="tiktok-url">URL do TikTok</Label>
                            <Input 
                              id="tiktok-url" 
                              value={settings.socialMedia.tiktok.url}
                              onChange={(e) => handleChange('socialMedia', 'tiktok', {
                                ...settings.socialMedia.tiktok,
                                url: e.target.value
                              })}
                              placeholder="https://tiktok.com/@suaconta"
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Twitter (X) */}
                      <div className="space-y-2 border-b pb-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="twitter-enabled" 
                            checked={settings.socialMedia.twitter.enabled}
                            onCheckedChange={(checked) => 
                              handleChange('socialMedia', 'twitter', {
                                ...settings.socialMedia.twitter,
                                enabled: !!checked
                              })
                            }
                          />
                          <label 
                            htmlFor="twitter-enabled" 
                            className="text-sm font-medium leading-none"
                          >
                            Twitter / X
                          </label>
                        </div>
                        
                        {settings.socialMedia.twitter.enabled && (
                          <div className="pt-2">
                            <Label htmlFor="twitter-url">URL do Twitter/X</Label>
                            <Input 
                              id="twitter-url" 
                              value={settings.socialMedia.twitter.url}
                              onChange={(e) => handleChange('socialMedia', 'twitter', {
                                ...settings.socialMedia.twitter,
                                url: e.target.value
                              })}
                              placeholder="https://twitter.com/suaconta"
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Website */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="website-enabled" 
                            checked={settings.socialMedia.website.enabled}
                            onCheckedChange={(checked) => 
                              handleChange('socialMedia', 'website', {
                                ...settings.socialMedia.website,
                                enabled: !!checked
                              })
                            }
                          />
                          <label 
                            htmlFor="website-enabled" 
                            className="text-sm font-medium leading-none"
                          >
                            Website
                          </label>
                        </div>
                        
                        {settings.socialMedia.website.enabled && (
                          <div className="pt-2">
                            <Label htmlFor="website-url">URL do Website</Label>
                            <Input 
                              id="website-url" 
                              value={settings.socialMedia.website.url}
                              onChange={(e) => handleChange('socialMedia', 'website', {
                                ...settings.socialMedia.website,
                                url: e.target.value
                              })}
                              placeholder="https://seusite.com.br"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="flex justify-end">
        <Button className="bg-shop-red hover:bg-shop-red/90" onClick={handleUpdateSettings}>
          <Save size={16} className="mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};

export default StoreSettings;
