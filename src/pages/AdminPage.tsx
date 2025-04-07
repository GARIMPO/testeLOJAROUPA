import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Save, Filter, Upload, X, Star } from 'lucide-react';
import { Product } from '@/types';
import { getAllProducts, saveProductsToLocalStorage } from '@/data/products';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import StoreSettings from '@/components/StoreSettings';
import { toast } from 'sonner';

const AdminPage = () => {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [productImages, setProductImages] = useState<string[]>(['', '', '', '']);
  const previousEditingProductId = useRef<string>('');
  const [headerCustomLinks, setHeaderCustomLinks] = useState<Array<{label: string; enabled: boolean}>>([]);
  
  const categories = ['all', 'acessórios', 'calçados', 'feminino', 'kids', 'masculino'];
  
  // Compute filter categories including enabled custom links
  const filterCategories = [...categories];
  
  useEffect(() => {
    // Add enabled custom links to filter categories
    if (headerCustomLinks && headerCustomLinks.length > 0) {
      headerCustomLinks.forEach(link => {
        if (link.enabled) {
          const normalizedLink = getNormalizedLink(link.label);
          if (!filterCategories.includes(normalizedLink)) {
            filterCategories.push(normalizedLink);
          }
        }
      });
    }
  }, [headerCustomLinks]);
  
  useEffect(() => {
    // Registrar logs de debug para todas as categorias
    console.log("====== DEBUG CATEGORIAS ======");
    try {
      const storedProducts = localStorage.getItem('storeProducts');
      if (storedProducts) {
        const products = JSON.parse(storedProducts);
        console.log("Total de produtos:", products.length);
        
        // Mapear produtos por categoria
        const categorias = products.reduce((acc, product) => {
          const cat = product.category.toLowerCase();
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {});
        
        console.log("Produtos por categoria:", categorias);
        
        // Mapear produtos por tipo
        const tipos = products.reduce((acc, product) => {
          const tipo = product.type;
          acc[tipo] = (acc[tipo] || 0) + 1;
          return acc;
        }, {});
        
        console.log("Produtos por tipo:", tipos);
        
        // Verificar discrepâncias entre categoria e tipo
        const discrepancias = products.filter(p => {
          if (normalizeCategory(p.category) === 'calçados' && p.type !== 'shoes') return true;
          if (normalizeCategory(p.category) === 'acessórios' && p.type !== 'accessory') return true;
          return false;
        });
        
        if (discrepancias.length > 0) {
          console.log("Produtos com discrepância entre categoria e tipo:", discrepancias);
        }
      }
    } catch (e) {
      console.error('Erro ao analisar categorias:', e);
    }
    console.log("====== FIM DEBUG CATEGORIAS ======");
  }, []);
  
  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem('storeProducts');
      if (storedProducts) {
        setProductsList(JSON.parse(storedProducts));
        setFilteredProducts(JSON.parse(storedProducts));
      } else {
        // Initialize with empty array if no products exist
        const emptyProducts: Product[] = [];
        setProductsList(emptyProducts);
        setFilteredProducts(emptyProducts);
      }
    } catch (e) {
      console.error('Failed to load products from localStorage', e);
      // Initialize with empty array in case of error
      const emptyProducts: Product[] = [];
      setProductsList(emptyProducts);
      setFilteredProducts(emptyProducts);
    }
  }, []);
  
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(productsList);
    } else {
      const normalizedSelectedCategory = normalizeCategory(selectedCategory);
      console.log("Filtrando por categoria:", normalizedSelectedCategory);
      
      setFilteredProducts(productsList.filter(product => {
        const normalizedProductCategory = normalizeCategory(product.category);
        
        if (normalizedSelectedCategory === 'calçados') {
          const isMatch = normalizedProductCategory === 'calçados' || product.type === 'shoes';
          console.log(`Produto: ${product.name}, categoria: ${product.category}, tipo: ${product.type}, match: ${isMatch}`);
          return isMatch;
        } else if (normalizedSelectedCategory === 'acessórios') {
          const isMatch = normalizedProductCategory === 'acessórios' || product.type === 'accessory';
          console.log(`Produto: ${product.name}, categoria: ${product.category}, tipo: ${product.type}, match: ${isMatch}`);
          return isMatch;
        } else {
          // Check if it's a custom link category
          const isCustomLinkCategory = headerCustomLinks.some(link => 
            link.enabled && getNormalizedLink(link.label) === normalizedSelectedCategory
          );
          
          if (isCustomLinkCategory) {
            const isMatch = normalizedProductCategory === normalizedSelectedCategory;
            console.log(`Produto: ${product.name}, categoria: ${product.category}, categoria customizada: ${normalizedSelectedCategory}, match: ${isMatch}`);
            return isMatch;
          } else {
            const isMatch = normalizedProductCategory === normalizedSelectedCategory;
            console.log(`Produto: ${product.name}, categoria: ${product.category}, categoria normalizada: ${normalizedProductCategory}, comparando com: ${normalizedSelectedCategory}, match: ${isMatch}`);
            return isMatch;
          }
        }
      }));
    }
  }, [selectedCategory, productsList, headerCustomLinks]);

  useEffect(() => {
    if (editingProduct) {
      // Apenas configure as imagens inicialmente quando o produto for carregado pela primeira vez
      // Não reconfigurar quando outros campos são editados
      if (!productImages.some(img => img) || editingProduct.id !== previousEditingProductId.current) {
        const mainImage = editingProduct.imageUrl || '';
        const additionalImages = [...(editingProduct.images || [])].slice(0, 3);
        
        const newProductImages = [mainImage];
        
        for (const img of additionalImages) {
          if (img && img !== mainImage) {
            newProductImages.push(img);
          }
        }
        
        while (newProductImages.length < 4) {
          newProductImages.push('');
        }
        
        setProductImages(newProductImages);
        
        // Guarde o ID do produto atual para saber quando mudamos para um produto diferente
        previousEditingProductId.current = editingProduct.id;
      }
    } else {
      setProductImages(['', '', '', '']);
      previousEditingProductId.current = '';
    }
  }, [editingProduct]);
  
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('storeSettings');
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        if (parsedSettings?.headerLinks?.customLinks) {
          setHeaderCustomLinks(parsedSettings.headerLinks.customLinks);
        }
      }
    } catch (error) {
      console.error('Failed to load custom links from settings:', error);
    }
  }, []);
  
  const handleNewProduct = () => {
    // Gerar um ID único baseado em timestamp
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 1000);
    
    const newProduct: Product = {
      id: `new-${timestamp}-${randomId}`,
      name: '',
      description: '',
      price: 0,
      discount: 0,
      imageUrl: '',
      images: [],
      category: '',  // Campo obrigatório que deve ser selecionado pelo usuário
      type: 'clothing',
      sizes: ['P', 'M', 'G'],
      colors: ['Preto', 'Branco'],
      stock: 10, // Valor padrão mais realista
      featured: false
    };
    
    setEditingProduct(newProduct);
    setProductImages(['', '', '', '']);
    setIsDialogOpen(true);
  };
  
  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
    setIsDialogOpen(true);
  };
  
  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      const updatedProducts = productsList.filter(p => p.id !== id);
      setProductsList(updatedProducts);
      saveProductsToLocalStorage(updatedProducts);
      toast.success('Produto excluído com sucesso');
    }
  };

  // Helper function to compress image
  const compressImage = async (base64String: string, quality = 0.6, maxWidth = 800): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        
        // Estabelecer um timeout para evitar processamento infinito
        const timeoutId = setTimeout(() => {
          console.error('Timeout ao processar imagem');
          // Retornar a imagem original em caso de timeout
          resolve(base64String);
        }, 10000); // 10 segundos
        
        img.onload = () => {
          clearTimeout(timeoutId);
          
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // Calculate new dimensions if width exceeds maxWidth
            if (width > maxWidth) {
              const ratio = maxWidth / width;
              width = maxWidth;
              height = height * ratio;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              console.error('Could not get canvas context');
              resolve(base64String); // Retornar original em caso de erro
              return;
            }
            
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedDataUrl);
          } catch (err) {
            console.error('Erro durante a compressão da imagem:', err);
            resolve(base64String); // Retornar original em caso de erro
          }
        };
        
        img.onerror = (err) => {
          clearTimeout(timeoutId);
          console.error('Erro ao carregar imagem:', err);
          resolve(base64String); // Retornar original em caso de erro
        };
        
        img.src = base64String;
      } catch (err) {
        console.error('Erro crítico na compressão:', err);
        resolve(base64String); // Retornar original em caso de erro
      }
    });
  };
  
  // Helper function to normalize category strings
  const normalizeCategory = (categoryStr: string) => {
    if (!categoryStr) return '';
    
    // 1. Trim spaces and convert to lowercase
    let normalized = categoryStr.trim().toLowerCase();
    
    // 2. Handle common variations and normalize
    if (normalized === 'calcados' || normalized === 'calçados' || normalized === 'shoes') {
      normalized = 'calçados';
    } else if (normalized === 'acessorios' || normalized === 'acessórios' || normalized === 'accessories' || normalized === 'accessory') {
      normalized = 'acessórios';
    } else if (normalized === 'masculino' || normalized === 'men' || normalized === 'homem') {
      normalized = 'masculino';
    } else if (normalized === 'feminino' || normalized === 'women' || normalized === 'mulher') {
      normalized = 'feminino';
    } else if (normalized === 'infantil' || normalized === 'children' || normalized === 'kids' || normalized === 'kid') {
      normalized = 'kids';
    } else if (normalized === 'oferta' || normalized === 'ofertas' || normalized === 'promoção' || normalized === 'off' || normalized === 'sale') {
      normalized = 'off';
    } else if (normalized === 'novidade' || normalized === 'novidades' || normalized === 'new' || normalized === 'new arrivals') {
      normalized = 'novidades';
    }
    
    return normalized;
  };
  
  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    
    // Verificar campos obrigatórios
    const missingFields = [];
    if (!editingProduct.name) missingFields.push('Nome');
    if (!editingProduct.description) missingFields.push('Descrição');
    if (!editingProduct.category) missingFields.push('Categoria');
    
    if (missingFields.length > 0) {
      toast.error(`Por favor, preencha todos os campos obrigatórios: ${missingFields.join(', ')}`);
      // Não limpa as imagens quando houver erro de validação
      return;
    }

    // Validar que a categoria foi selecionada e é válida
    if (editingProduct.category.trim() === '') {
      toast.error('É necessário selecionar uma categoria para o produto');
      // Não limpa as imagens quando houver erro de validação
      return;
    }
    
    // Garantir que a categoria seja uma das válidas
    const validCategories = ['feminino', 'masculino', 'kids', 'acessórios', 'calçados', 'featured', 'off'];
    
    // Adicionar links personalizados como categorias válidas
    const customLinkCategories = headerCustomLinks
      .filter(link => link.enabled)
      .map(link => getNormalizedLink(link.label));
    
    const allValidCategories = [...validCategories, ...customLinkCategories];
    
    const normalizedCategory = normalizeCategory(editingProduct.category);
    console.log("Categoria normalizada:", normalizedCategory);
    
    // Verificar se a categoria está na lista de categorias válidas ou é um link personalizado
    if (!allValidCategories.includes(normalizedCategory)) {
      toast.error(`A categoria "${editingProduct.category}" não é válida. Escolha uma das categorias disponíveis.`);
      // Não limpa as imagens quando houver erro de validação
      return;
    }
    
    // Normalizar a categoria 
    editingProduct.category = normalizedCategory;
    
    // Garantir que o tipo de produto seja consistente com a categoria principal
    // Para links personalizados, manter o tipo atual ou definir um padrão
    let tipoAtualizado = false;
    
    if (normalizedCategory === 'calçados' && editingProduct.type !== 'shoes') {
      console.log("Ajustando tipo para shoes");
      editingProduct.type = 'shoes';
      tipoAtualizado = true;
    } else if (normalizedCategory === 'acessórios' && editingProduct.type !== 'accessory') {
      console.log("Ajustando tipo para accessory");
      editingProduct.type = 'accessory';
      tipoAtualizado = true;
    } else if ((normalizedCategory === 'feminino' || normalizedCategory === 'masculino' || normalizedCategory === 'kids') && editingProduct.type !== 'clothing') {
      console.log("Ajustando tipo para clothing");
      editingProduct.type = 'clothing';
      tipoAtualizado = true;
    } else if (!validCategories.includes(normalizedCategory)) {
      // Para links personalizados, usar 'clothing' como padrão se não tiver um tipo definido
      if (!editingProduct.type) {
        console.log("Definindo tipo padrão para categoria personalizada");
        editingProduct.type = 'clothing';
        tipoAtualizado = true;
      }
    }
    
    // Garantir que arrays de tamanhos e cores não sejam undefined
    if (!editingProduct.sizes || !Array.isArray(editingProduct.sizes)) {
      editingProduct.sizes = [];
    }
    
    if (!editingProduct.colors || !Array.isArray(editingProduct.colors)) {
      editingProduct.colors = [];
    }
    
    // Ajustar tamanhos com base no tipo se necessário e apenas se não foram especificados
    if (tipoAtualizado && editingProduct.sizes.length === 0) {
      if (editingProduct.type === 'shoes') {
        console.log("Definindo tamanhos padrão para calçados");
        editingProduct.sizes = ['38', '39', '40', '41', '42'];
      } else if (editingProduct.type === 'accessory') {
        console.log("Definindo tamanhos padrão para acessórios");
        editingProduct.sizes = ['Único'];
      } else if (editingProduct.type === 'clothing') {
        console.log("Definindo tamanhos padrão para roupas");
        editingProduct.sizes = ['P', 'M', 'G'];
      }
    }
    
    // Ajustar cores se não foram especificadas
    if (editingProduct.colors.length === 0) {
      console.log("Definindo cores padrão");
      editingProduct.colors = ['Preto'];
    }
    
    console.log("Produto ao salvar:", JSON.stringify({
      id: editingProduct.id,
      name: editingProduct.name,
      category: editingProduct.category,
      type: editingProduct.type,
      sizes: editingProduct.sizes
    }));
    
    // Check if there's at least one image
    const hasAtLeastOneImage = productImages.some(img => img);
    if (!hasAtLeastOneImage) {
      toast.error('Por favor, adicione pelo menos uma imagem');
      return;
    }

    // Registro de debug para verificar as imagens antes do processamento
    console.log('Imagens antes de processar:', productImages.map(img => img ? `${img.substring(0, 30)}...` : 'vazio'));

    try {
      // Compress images to reduce storage size
      const compressedImages = await Promise.all(
        productImages.map(async img => {
          if (!img) return '';
          try {
            return await compressImage(img);
          } catch (err) {
            console.error("Failed to compress image:", err);
            return img; // Use original if compression fails
          }
        })
      );
      
      // Find first non-empty image for main image
      const mainImage = compressedImages.find(img => img) || '';
      // Get other non-empty images that aren't duplicates of main image
      const additionalImages = compressedImages.filter(img => img && img !== mainImage);
      
      console.log('Imagem principal após processamento:', mainImage ? `${mainImage.substring(0, 30)}...` : 'vazio');
      console.log('Imagens adicionais após processamento:', additionalImages.length);
      
      const updatedProduct: Product = {
        ...editingProduct,
        imageUrl: mainImage,
        images: additionalImages
      };
      
      // Try to save with storage management
      const updatedProductsList = [...productsList];
      const existingIndex = updatedProductsList.findIndex(p => p.id === updatedProduct.id);
      
      if (existingIndex >= 0) {
        updatedProductsList[existingIndex] = updatedProduct;
      } else {
        updatedProductsList.push(updatedProduct);
      }
      
      // Clear localStorage if it's getting too full
      const itemsToRemove = ['bannerImage', 'footerText'];
      for (const item of itemsToRemove) {
        const value = localStorage.getItem(item);
        if (value) {
          sessionStorage.setItem(`temp_${item}`, value);
          localStorage.removeItem(item);
        }
      }
      
      try {
        // Try to save products
        saveProductsToLocalStorage(updatedProductsList);
        
        // Restore other items
        for (const item of itemsToRemove) {
          const value = sessionStorage.getItem(`temp_${item}`);
          if (value) {
            localStorage.setItem(item, value);
            sessionStorage.removeItem(`temp_${item}`);
          }
        }
        
        setProductsList(updatedProductsList);
        setIsDialogOpen(false);
        setEditingProduct(null);
        toast.success('Produto salvo com sucesso');
        
        // Disparar evento para atualizar produtos em todas as janelas
        try {
          // Disparar evento de storage padrão
          window.dispatchEvent(new Event('storage'));
          
          // Disparar evento customizado para atualização
          window.dispatchEvent(new Event('refreshProducts'));
          
          // Forçar atualização na mesma janela
          const currentProducts = getAllProducts();
          localStorage.setItem('storeProducts', JSON.stringify([]));
          setTimeout(() => {
            localStorage.setItem('storeProducts', JSON.stringify(currentProducts));
          }, 100);
          
          console.log("Eventos de atualização disparados");
          
          // Tentar atualizar vários níveis de navegação
          if (window.parent) {
            window.parent.dispatchEvent(new Event('storage'));
            window.parent.dispatchEvent(new Event('refreshProducts'));
          }
        } catch (e) {
          console.error('Erro ao disparar evento de storage:', e);
        }
      } catch (e) {
        console.error('Failed to save to localStorage after cleanup', e);
        
        // Try harder compression if saving still fails
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          // More aggressive compression
          const furtherCompressedImages = await Promise.all(
            compressedImages.map(async img => {
              if (!img) return '';
              try {
                return await compressImage(img, 0.3, 400); // Lower quality, smaller size
              } catch (err) {
                return img;
              }
            })
          );
          
          const smallerMainImage = furtherCompressedImages.find(img => img) || '';
          const smallerAdditionalImages = furtherCompressedImages.filter(img => img && img !== smallerMainImage);
          
          const smallerProduct: Product = {
            ...editingProduct,
            imageUrl: smallerMainImage,
            images: smallerAdditionalImages.slice(0, 2) // Limit to 2 additional images
          };
          
          if (existingIndex >= 0) {
            updatedProductsList[existingIndex] = smallerProduct;
          } else {
            updatedProductsList.push(smallerProduct);
          }
          
          try {
            saveProductsToLocalStorage(updatedProductsList);
            setProductsList(updatedProductsList);
            setIsDialogOpen(false);
            setEditingProduct(null);
            toast.success('Produto salvo com sucesso (imagens comprimidas para economizar espaço)');
          } catch (storageError) {
            // If all else fails, try removing some products
            if (updatedProductsList.length > 5) {
              const reducedList = updatedProductsList.slice(-5); // Keep only most recent 5
              try {
                localStorage.setItem('storeProducts', JSON.stringify(reducedList));
                setProductsList(reducedList);
                setIsDialogOpen(false);
                setEditingProduct(null);
                toast.warning('Armazenamento limitado: produtos antigos foram removidos para salvar o novo produto');
              } catch (finalError) {
                toast.error('Não foi possível salvar o produto mesmo após todas as tentativas de otimização. Tente excluir mais produtos ou usar imagens menores.');
              }
            } else {
              toast.error('Não foi possível salvar o produto. O armazenamento local está completamente cheio.');
            }
          }
        } else {
          toast.error('Erro ao salvar o produto.');
        }
      }
    } catch (err) {
      console.error('Error in image processing:', err);
      toast.error('Ocorreu um erro ao processar as imagens. Tente novamente.');
    }
  };
  
  const handleFieldChange = (field: keyof Product, value: any) => {
    if (!editingProduct) return;
    
    // Se estiver atualizando a categoria, atualizar o tipo automaticamente
    if (field === 'category') {
      // Normalizar o valor da categoria para garantir consistência
      const normalizedValue = normalizeCategory(value);
      console.log(`Alterando categoria para: ${normalizedValue}`);
      
      // Determinar tipo apropriado com base na categoria
      let newType: 'clothing' | 'shoes' | 'accessory';
      let newSizes: string[] = [...editingProduct.sizes];
      
      // Definir o tipo com base na categoria
      if (normalizedValue === 'calçados') {
        newType = 'shoes';
        
        // Sugerir tamanhos adequados para calçados se os tamanhos atuais não forem numéricos
        if (!newSizes.length || !newSizes.some(size => /^\d+$/.test(size))) {
          newSizes = ['38', '39', '40', '41', '42'];
        }
      } else if (normalizedValue === 'acessórios') {
        newType = 'accessory';
        
        // Sugerir "Único" para acessórios se os tamanhos atuais forem numéricos ou padrão de roupas
        if (!newSizes.length || newSizes.some(size => /^\d+$/.test(size)) || 
            (newSizes.includes('P') && newSizes.includes('M') && newSizes.includes('G'))) {
          newSizes = ['Único'];
        }
      } else {
        // Para categorias de roupas (feminino, masculino, kids)
        newType = 'clothing';
        
        // Sugerir tamanhos padrão para roupas se os tamanhos atuais forem numéricos ou "Único"
        if (!newSizes.length || newSizes.includes('Único') || newSizes.some(size => /^\d+$/.test(size))) {
          newSizes = ['P', 'M', 'G'];
        }
      }
      
      console.log(`Tipo de produto definido automaticamente: ${newType}`);
      console.log(`Tamanhos sugeridos: ${newSizes.join(', ')}`);
      
      // Atualizar o produto com a nova categoria, tipo e tamanhos sugeridos
      // IMPORTANTE: Preservar as imagens que já foram carregadas
      setEditingProduct({
        ...editingProduct,
        [field]: normalizedValue,
        type: newType,
        sizes: newSizes
      });
      
      // Não resetar o estado das imagens quando mudar a categoria
    } else {
      // Para outros campos, apenas atualizar o valor normalmente
      // IMPORTANTE: Preservar as imagens que já foram carregadas
      setEditingProduct({
        ...editingProduct,
        [field]: value
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      
      // Verificação mais estrita de tamanho - limite de 2MB para garantir melhor desempenho
      const maxSizeMB = 2;
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`A imagem é muito grande. O tamanho máximo é ${maxSizeMB}MB.`);
        toast.info('Imagens menores melhoram a performance do site.');
        return;
      }

      toast.info(`Processando imagem ${index + 1}...`, { duration: 2000 });
      console.log(`Iniciando upload da imagem ${index + 1}, tipo: ${file.type}, tamanho: ${(file.size / 1024).toFixed(2)}KB`);

      // Verificar o tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast.error(`O arquivo selecionado não é uma imagem. Tipo: ${file.type}`);
        return;
      }

      const reader = new FileReader();
      
      // Criar um timeout para interromper o processo se demorar muito
      const timeout = setTimeout(() => {
        reader.abort();
        toast.error(`Tempo limite excedido ao processar a imagem ${index + 1}.`);
      }, 15000); // 15 segundos
      
      reader.onloadend = async () => {
        try {
          // Limpar o timeout
          clearTimeout(timeout);
          
          if (!reader.result || typeof reader.result !== 'string') {
            toast.error(`Erro ao ler a imagem ${index + 1}.`);
            return;
          }
          
          console.log(`Imagem ${index + 1} carregada, comprimindo...`);
          
          // Determinar a qualidade de compressão com base no tamanho do arquivo
          const quality = file.size > 0.5 * 1024 * 1024 ? 0.4 : 0.6; // Mais compressão para arquivos maiores
          const maxWidth = file.size > 1 * 1024 * 1024 ? 600 : 800; // Menor resolução para arquivos maiores
          
          // Pre-compress image right at upload time com parâmetros ajustados
          const compressedImage = await compressImage(reader.result, quality, maxWidth);
          
          // Atualizar APENAS a imagem específica sem afetar as outras
          setProductImages(prevImages => {
            const newImages = [...prevImages];
            newImages[index] = compressedImage;
            console.log(`Imagem ${index + 1} comprimida e salva com sucesso.`);
            return newImages;
          });
          
          toast.success(`Imagem ${index + 1} carregada com sucesso!`);
        } catch (err) {
          console.error('Failed to compress image at upload time:', err);
          
          // Limpar o timeout em caso de erro
          clearTimeout(timeout);
          
          // Tentar compressão mais agressiva em caso de erro
          try {
            if (!reader.result || typeof reader.result !== 'string') {
              toast.error(`Erro ao ler a imagem ${index + 1}.`);
              return;
            }
            
            const emergencyCompressed = await compressImage(reader.result, 0.3, 400);
            setProductImages(prevImages => {
              const newImages = [...prevImages];
              newImages[index] = emergencyCompressed;
              console.log(`Imagem ${index + 1} salva com compressão de emergência.`);
              return newImages;
            });
            toast.success(`Imagem ${index + 1} carregada com compressão adicional.`);
          } catch (finalErr) {
            console.error('Erro crítico ao comprimir imagem:', finalErr);
            
            // Último recurso - usar a imagem original se estiver disponível
            if (reader.result && typeof reader.result === 'string') {
              setProductImages(prevImages => {
                const newImages = [...prevImages];
                newImages[index] = reader.result as string;
                console.log(`Imagem ${index + 1} salva sem compressão (último recurso).`);
                return newImages;
              });
              toast.warning(`Imagem ${index + 1} carregada sem compressão. O sistema pode ficar lento.`);
            } else {
              toast.error(`Não foi possível processar a imagem ${index + 1}.`);
            }
          }
        }
      };
      
      reader.onerror = (error) => {
        // Limpar o timeout em caso de erro
        clearTimeout(timeout);
        
        console.error('Erro ao ler o arquivo:', error);
        toast.error(`Erro ao processar a imagem ${index + 1}.`);
      };
      
      reader.readAsDataURL(file);
    } catch (generalError) {
      console.error('Erro geral ao carregar imagem:', generalError);
      toast.error('Ocorreu um erro ao processar a imagem. Por favor, tente novamente.');
    }
  };

  const handleRemoveImage = (index: number) => {
    console.log(`Removendo imagem do índice ${index}`);
    
    setProductImages(prevImages => {
      const newImages = [...prevImages];
      newImages[index] = '';
      console.log(`Imagem ${index + 1} removida com sucesso.`);
      return newImages;
    });
    
    toast.info(`Imagem ${index + 1} removida.`);
  };
  
  // Função para renderizar o badge de categoria com a cor apropriada
  const renderCategoryBadge = (category: string) => {
    let bgColor = "bg-gray-100";
    let textColor = "text-gray-800";
    
    switch(category.toLowerCase()) {
      case 'feminino':
        bgColor = "bg-pink-100";
        textColor = "text-pink-800";
        break;
      case 'masculino':
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        break;
      case 'kids':
        bgColor = "bg-purple-100";
        textColor = "text-purple-800";
        break;
      case 'acessórios':
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-800";
        break;
      case 'calçados':
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        break;
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor} capitalize`}>
        {category}
      </span>
    );
  };
  
  // Get normalized category link
  const getNormalizedLink = (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };
  
  return (
    <>
      <Header />
      <main className="py-8">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold">Painel do Administrador</h1>
            <div className="md:hidden">
              <Button onClick={handleNewProduct} className="w-full">
                <Plus size={16} className="mr-2" />
                Novo Produto
              </Button>
            </div>
            <div className="hidden md:block">
              <Button onClick={handleNewProduct}>
                <Plus size={16} className="mr-2" />
                Novo Produto
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="products">
            <TabsList className="mb-6">
              <TabsTrigger value="products">Produtos</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="products" className="space-y-6">
              <Accordion type="single" collapsible defaultValue="productsList">
                <AccordionItem value="productsList">
                  <AccordionTrigger className="font-bold">
                    Lista de Produtos
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="mb-4">
                      <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                        <div className="flex items-center gap-2 mb-2">
                          <CollapsibleTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Filter size={16} className="mr-2" />
                              Filtrar por Categoria ou Link Personalizado
                            </Button>
                          </CollapsibleTrigger>
                          {selectedCategory !== 'all' && (
                            <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                              Categoria: {selectedCategory}
                            </span>
                          )}
                        </div>
                        <CollapsibleContent className="bg-gray-50 p-4 rounded-lg mb-4">
                          <div className="flex flex-wrap gap-2">
                            {categories.map(category => (
                              <Button
                                key={category}
                                variant={selectedCategory === category ? "default" : "outline"}
                                size="sm"
                                className={selectedCategory === category ? "bg-shop-red hover:bg-shop-red/90" : ""}
                                onClick={() => setSelectedCategory(category)}
                              >
                                {category === 'all' ? 'Todas' : category.charAt(0).toUpperCase() + category.slice(1)}
                              </Button>
                            ))}
                            
                            {/* Custom link filter buttons */}
                            {headerCustomLinks.filter(link => link.enabled).map((link, index) => {
                              const normalizedLink = getNormalizedLink(link.label);
                              return (
                                <Button
                                  key={`custom-${index}`}
                                  variant={selectedCategory === normalizedLink ? "default" : "outline"}
                                  size="sm"
                                  className={selectedCategory === normalizedLink ? "bg-shop-red hover:bg-shop-red/90" : ""}
                                  onClick={() => setSelectedCategory(normalizedLink)}
                                >
                                  {link.label}
                                </Button>
                              );
                            })}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Imagem</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Preço</TableHead>
                            <TableHead>Estoque</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredProducts.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell className="font-medium">
                                {product.imageUrl && (
                                  <img 
                                    src={product.imageUrl} 
                                    alt={product.name} 
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                )}
                              </TableCell>
                              <TableCell className="font-medium">{product.name}</TableCell>
                              <TableCell>
                                <div className="flex flex-col space-y-1">
                                  {renderCategoryBadge(product.category)}
                                  {product.featured && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center">
                                      <Star size={10} className="mr-1" /> Destaque
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {product.discount > 0 ? (
                                  <>
                                    <span className="text-shop-red font-semibold">
                                      R$ {((product.price * (100 - product.discount)) / 100).toFixed(2)}
                                    </span>
                                    <br />
                                    <span className="text-gray-400 text-sm line-through">
                                      R$ {product.price.toFixed(2)}
                                    </span>
                                  </>
                                ) : (
                                  <span>R$ {product.price.toFixed(2)}</span>
                                )}
                              </TableCell>
                              <TableCell>{product.stock} unids.</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditProduct(product)}
                                  >
                                    <Pencil size={16} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => handleDeleteProduct(product.id)}
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
            
            <TabsContent value="settings">
              <StoreSettings />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct?.id.startsWith('new-') ? 'Novo Produto' : 'Editar Produto'}
            </DialogTitle>
            <DialogDescription>
              Complete os detalhes do produto abaixo. Todos os campos marcados com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>
          
          {editingProduct && (
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto*</Label>
                  <Input
                    id="name"
                    value={editingProduct.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="Nome do produto"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria*</Label>
                  <select
                    id="category"
                    className="w-full rounded-md border border-gray-300 p-2"
                    value={editingProduct.category}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                  >
                    <option value="">Selecione uma categoria</option>
                    <optgroup label="Categorias Principais">
                      <option value="acessórios">Acessórios</option>
                      <option value="calçados">Calçados</option>
                      <option value="feminino">Feminino</option>
                      <option value="kids">Kids</option>
                      <option value="masculino">Masculino</option>
                    </optgroup>
                    
                    {headerCustomLinks.length > 0 && (
                      <optgroup label="Links Personalizados">
                        {headerCustomLinks.map((link, index) => (
                          link.enabled && (
                            <option 
                              key={`link-${index}`} 
                              value={getNormalizedLink(link.label)}
                            >
                              {link.label}
                            </option>
                          )
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    A categoria determina onde o produto será exibido na loja e define automaticamente o tipo do produto.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço*</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) => handleFieldChange('price', parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="discount">Desconto (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={editingProduct.discount}
                    onChange={(e) => handleFieldChange('discount', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stock">Estoque*</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={editingProduct.stock}
                    onChange={(e) => handleFieldChange('stock', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição*</Label>
                <Textarea
                  id="description"
                  value={editingProduct.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Descreva o produto detalhadamente"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="featured">Em Destaque</Label>
                  <div className="flex items-start">
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => {
                      // Toggle the featured value when clicking anywhere in this div
                      handleFieldChange('featured', !editingProduct.featured);
                    }}>
                      <Checkbox
                        id="featured"
                        checked={editingProduct.featured}
                        onCheckedChange={(checked) => handleFieldChange('featured', !!checked)}
                        className={`cursor-pointer ${editingProduct.featured ? "bg-shop-red border-shop-red" : ""}`}
                      />
                      <label htmlFor="featured" className="text-sm cursor-pointer">
                        Mostrar este produto em destaque na página inicial
                      </label>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Produtos em destaque aparecem na seção "Produtos em Destaque" da página inicial.
                    Use esta opção para promover seus melhores produtos.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Tamanhos Sugeridos</Label>
                  <div className="p-2 border rounded bg-gray-50">
                    {editingProduct.type === 'clothing' && (
                      <div className="text-sm text-gray-600">
                        Sugestão para roupas: P, M, G, GG
                      </div>
                    )}
                    {editingProduct.type === 'shoes' && (
                      <div className="text-sm text-gray-600">
                        Sugestão para calçados: 34, 35, 36, 37, 38, 39, 40, 41, 42
                      </div>
                    )}
                    {editingProduct.type === 'accessory' && (
                      <div className="text-sm text-gray-600">
                        Sugestão para acessórios: Único (ou P, M, G para cintos/pulseiras)
                      </div>
                    )}
                    <div className="mt-1 text-xs text-blue-600">
                      Tipo do produto (definido automaticamente): {editingProduct.type === 'clothing' ? 'Roupa' : editingProduct.type === 'shoes' ? 'Calçado' : 'Acessório'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Promoção</Label>
                <div className="flex items-start">
                  <div className="flex items-center space-x-2 cursor-pointer" onClick={() => {
                    // Toggle the discount value when clicking anywhere in this div
                    const newDiscountValue = editingProduct.discount > 0 ? 0 : 10;
                    handleFieldChange('discount', newDiscountValue);
                  }}>
                    <Checkbox
                      id="promotion"
                      checked={editingProduct.discount > 0}
                      className="cursor-pointer"
                      onCheckedChange={(checked) => {
                        if (checked) {
                          const discountValue = editingProduct.discount === 0 ? 10 : editingProduct.discount;
                          handleFieldChange('discount', discountValue);
                        } else {
                          handleFieldChange('discount', 0);
                        }
                      }}
                    />
                    <label htmlFor="promotion" className="text-sm cursor-pointer">
                      Este produto está em promoção (aparecerá na seção "Produtos em Oferta" da página inicial)
                    </label>
                  </div>
                </div>
                
                {editingProduct.discount > 0 && (
                  <div className="mt-2">
                    <Label htmlFor="discountValue">Percentual de desconto (%)</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="discountValue"
                        type="number"
                        min="1"
                        max="99"
                        value={editingProduct.discount.toString()}
                        onChange={(e) => handleFieldChange('discount', parseInt(e.target.value) || 0)}
                        className="w-24"
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <Label>Imagens do Produto*</Label>
                <p className="text-sm text-gray-500">
                  Adicione uma imagem principal e até 3 imagens adicionais para o produto.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="relative">
                      <div className={`h-32 rounded-md overflow-hidden border-2 ${index === 0 ? 'border-shop-red' : 'border-gray-200'} flex items-center justify-center bg-gray-50`}>
                        {productImages[index] ? (
                          <>
                            <img 
                              src={productImages[index]} 
                              alt={`Imagem ${index + 1}`} 
                              className="w-full h-full object-cover" 
                            />
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="sm" 
                              className="absolute top-1 right-1 w-6 h-6 p-0 rounded-full"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <X size={12} />
                            </Button>
                          </>
                        ) : (
                          <div className="text-center p-2">
                            <Upload size={20} className="mx-auto text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500">
                              {index === 0 ? 'Imagem principal*' : `Imagem ${index + 1}`}
                            </span>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        id={`image-upload-${index}`}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, index)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => document.getElementById(`image-upload-${index}`)?.click()}
                      >
                        <Upload size={14} className="mr-1" />
                        Upload
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sizes">Tamanhos (separados por vírgula)</Label>
                <Input
                  id="sizes"
                  value={editingProduct.sizes.join(', ')}
                  onChange={(e) => handleFieldChange('sizes', e.target.value.split(',').map(s => s.trim()))}
                  placeholder="P, M, G, GG"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Deixe em branco para produtos sem tamanhos específicos
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="colors">Cores (separadas por vírgula)</Label>
                <Input
                  id="colors"
                  value={editingProduct.colors.join(', ')}
                  onChange={(e) => handleFieldChange('colors', e.target.value.split(',').map(c => c.trim()))}
                  placeholder="Preto, Branco, Azul"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Deixe em branco para produtos sem cores específicas
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-shop-red hover:bg-shop-red/90" 
              onClick={handleSaveProduct}
            >
              <Save size={16} className="mr-2" />
              Salvar Produto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </>
  );
};

export default AdminPage;
