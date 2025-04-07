
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartItem from '@/components/CartItem';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowRight, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const CartPage = () => {
  const { cart, clearCart, cartTotal } = useCart();
  const navigate = useNavigate();
  
  const handleCheckout = () => {
    alert('Esta funcionalidade ainda não está disponível. Obrigado pela compreensão!');
  };
  
  return (
    <>
      <Header />
      <main className="py-8">
        <div className="container px-4 mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center">
            <ShoppingCart className="mr-3" /> Meu Carrinho
          </h1>
          
          {cart.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
                    <h2 className="font-semibold">Itens do Carrinho ({cart.length})</h2>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-shop-red hover:text-shop-red/80"
                      onClick={clearCart}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Limpar carrinho
                    </Button>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {cart.map((item) => (
                      <CartItem key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} item={item} />
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <Link to="/">
                      <Button variant="outline" size="sm" className="text-sm">
                        <ShoppingBag size={16} className="mr-2" />
                        Continuar comprando
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Order Summary */}
              <div>
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
                  <h2 className="font-semibold mb-4">Resumo do Pedido</h2>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>R$ {cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frete:</span>
                      <span>{cartTotal >= 199.9 ? 'Grátis' : 'R$ 15,00'}</span>
                    </div>
                    
                    {cartTotal < 199.9 && (
                      <div className="text-sm text-shop-red mt-2">
                        Falta R$ {(199.9 - cartTotal).toFixed(2)} para frete grátis!
                      </div>
                    )}
                    
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>R$ {(cartTotal + (cartTotal >= 199.9 ? 0 : 15)).toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Em até 12x sem juros
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-6 bg-shop-red hover:bg-shop-red/90"
                    onClick={handleCheckout}
                  >
                    Finalizar Compra
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-shop-light-gray mb-4">
                <ShoppingCart size={24} className="text-gray-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Seu carrinho está vazio</h2>
              <p className="text-gray-500 mb-6">Os produtos adicionados ao carrinho aparecerão aqui.</p>
              <Link to="/">
                <Button className="bg-shop-red hover:bg-shop-red/90">
                  Continuar comprando
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CartPage;
