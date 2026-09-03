import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  ShoppingCart,
  Package,
  X,
} from "lucide-react";
import { motion } from "framer-motion";

import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import {
  getAllProducts,
  searchProducts,
  applyVoucher,
  verifyVoucherOtp,
} from "@/lib/Api";

const DEFAULT_IMAGE =
  "https://vibe.filesafe.space/1780236389749984913/assets/d22b1889-f86c-4a2b-9c8f-18331f11dbad.png";

const inferCategory = (name: string): string => {
  const lowerName = name.toLowerCase();
  if (
    lowerName.includes("wine") ||
    lowerName.includes("prosecco") ||
    lowerName.includes("spirit")
  )
    return "Wines & Spirits";
  if (lowerName.includes("water")) return "Water";
  if (lowerName.includes("juice")) return "Juices";
  if (lowerName.includes("malt") || lowerName.includes("fresh"))
    return "Non-Carbonated Drinks";
  if (
    lowerName.includes("snack") ||
    lowerName.includes("chocolate") ||
    lowerName.includes("biscuit") ||
    lowerName.includes("parle")
  )
    return "Snacks";
  return "Carbonated Drinks";
};

const inferImage = (name: string): string => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("coke"))
    return "https://vibe.filesafe.space/1780236389749984913/assets/2222b3b4-4c84-41d0-aede-f849594da407.png";
  if (lowerName.includes("fanta"))
    return "https://vibe.filesafe.space/1780236389749984913/assets/6cc771b3-d5ce-46ab-bb5b-e0d3c12e6051.png";
  if (lowerName.includes("malt"))
    return "https://vibe.filesafe.space/1780236389749984913/assets/2cd385c4-f997-46da-8fd5-ca6921bc54fe.png";
  if (
    lowerName.includes("water") ||
    lowerName.includes("awake") ||
    lowerName.includes("voltic")
  )
    return "https://vibe.filesafe.space/1780236389749984913/assets/22663ea6-7afd-4189-800f-551e634541bc.png";
  if (
    lowerName.includes("wine") ||
    lowerName.includes("prosecco") ||
    lowerName.includes("bottega")
  )
    return "https://vibe.filesafe.space/1780236389749984913/assets/89ad9a2d-bd87-4408-a004-55f29ed356b4.png";
  if (lowerName.includes("juice"))
    return "https://vibe.filesafe.space/1780236389749984913/assets/371c451b-ea1a-4674-9c32-858ea1d16511.png";
  if (lowerName.includes("parle"))
    return "https://vibe.filesafe.space/1780236389749984913/assets/7ea70e85-bff6-4686-997d-e5438b1f764c.png";
  return DEFAULT_IMAGE;
};

const CACHE_KEY = "shopProductCache_v3";
const PAGE_SIZE = 8;

type CachedPage = { items: any[]; totalPages: number };

const mapApiProduct = (p: any) => ({
  id: p.id,
  category: inferCategory(p.name),
  name: p.name,
  price: p.list_price || 0,
  stock: p.qty_available || 0,
  image: p.image || inferImage(p.name),
});

const readTotalPages = (payload: any, page: number, itemCount: number) => {
  const meta = payload?.pagination || payload || {};
  const limit = Number(meta.limit) || PAGE_SIZE;
  const reported = Number(
    meta.totalPages ||
      payload?.totalPages ||
      payload?.total_pages ||
      payload?.pages ||
      0,
  );
  let totalPages = reported > 0 ? reported : page;
  if (meta.hasNext === false) {
    return Math.max(1, reported || page);
  }
  if ((meta.hasNext === true || itemCount >= limit) && totalPages <= page) {
    totalPages = page + 1;
  }
  return Math.max(1, totalPages);
};

const readStoredCache = (): Record<string, CachedPage> => {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    const next: Record<string, CachedPage> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (Array.isArray(value)) {
        next[key] = { items: value, totalPages: 1 };
      } else if (value && Array.isArray((value as CachedPage).items)) {
        next[key] = value as CachedPage;
      }
    }
    return next;
  } catch {
    return {};
  }
};

const Shop = () => {
  const { addItem } = useCart();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category");
  const mappedInitialCategory =
    initialCategory === "Wines" ? "Wines & Spirits" : initialCategory;

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    mappedInitialCategory ? [mappedInitialCategory] : [],
  );
  const [isRibbonVisible, setIsRibbonVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      const mappedCategory =
        category === "Wines" ? "Wines & Spirits" : category;
      setSelectedCategories([mappedCategory]);
    }
  }, [searchParams]);

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const pageCache = useRef<Record<string, CachedPage>>(readStoredCache());

  const saveCache = () => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(pageCache.current));
    } catch {}
  };

  const applyProducts = (
    key: string | number,
    items: any[],
    pages: number,
  ) => {
    const total = Math.max(1, pages);
    pageCache.current[String(key)] = { items, totalPages: total };
    saveCache();
    setAllProducts(items);
    setTotalPages(total);
  };

  const fetchProducts = async (page: number, background = false) => {
    const cached = pageCache.current[String(page)];
    if (cached?.items?.length) {
      setAllProducts(cached.items);
      if (cached.totalPages > 1) setTotalPages(cached.totalPages);
      setIsLoading(false);
    } else if (!background) {
      setIsLoading(true);
    }
    try {
      const response = await getAllProducts(page);
      const apiProducts = (response?.data?.data || []).map(mapApiProduct);
      if (apiProducts.length === 0 && page > 1) {
        setTotalPages(page - 1);
        setCurrentPage((prev) => Math.max(1, prev - 1));
        return;
      }
      if (response?.data?.data) {
        applyProducts(
          page,
          apiProducts,
          readTotalPages(response.data, page, apiProducts.length),
        );
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
      if (!pageCache.current[String(page)]) toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const prefetchNextPage = (page: number) => {
    if (pageCache.current[String(page)] || page < 1) return;
    getAllProducts(page)
      .then((response) => {
        if (response?.data?.data?.length) {
          const apiProducts = response.data.data.map(mapApiProduct);
          pageCache.current[String(page)] = {
            items: apiProducts,
            totalPages: readTotalPages(
              response.data,
              page,
              apiProducts.length,
            ),
          };
          saveCache();
          setTotalPages((prev) =>
            Math.max(
              prev,
              pageCache.current[String(page)]?.totalPages || prev,
            ),
          );
        }
      })
      .catch(() => {});
  };

  const fetchSearchProducts = async (query: string, page: number) => {
    const cacheKey = `search-${query}-${page}`;
    const cached = pageCache.current[cacheKey];
    if (cached?.items?.length) {
      setAllProducts(cached.items);
      if (cached.totalPages > 1) setTotalPages(cached.totalPages);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
    try {
      const response = await searchProducts(query, page);
      const apiProducts = (response?.data?.data || []).map(mapApiProduct);
      if (apiProducts.length === 0 && page > 1) {
        setTotalPages(page - 1);
        setCurrentPage((prev) => Math.max(1, prev - 1));
        return;
      }
      if (response?.data?.data) {
        applyProducts(
          cacheKey,
          apiProducts,
          readTotalPages(response.data, page, apiProducts.length),
        );
      } else {
        setAllProducts([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to search products", error);
      toast.error("Failed to search products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setActiveSearchQuery(searchQuery.trim());
      setCurrentPage(1);
      setIsSearching(true);
    } else {
      // Clear search, go back to normal browsing
      setActiveSearchQuery("");
      setIsSearching(false);
      setCurrentPage(1);
      fetchProducts(1);
    }
  };

  // Preload page 1 immediately on mount (so first visit is already fetching)
  useEffect(() => {
    if (!pageCache.current[1]) {
      fetchProducts(1);
      prefetchNextPage(2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeSearchQuery) {
      fetchSearchProducts(activeSearchQuery, currentPage);
    } else {
      fetchProducts(currentPage);
      prefetchNextPage(currentPage + 1); // Prefetch next page silently
    }
  }, [currentPage, activeSearchQuery]);

  const products = allProducts.filter((product) => {
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.category);
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const bestSellers = allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes("jojo energy") ||
      p.name.toLowerCase().includes("beyti mango juice") ||
      p.name.toLowerCase().includes("bel squeeze multifruit") ||
      p.name.toLowerCase().includes("belaqua sparkling water glass 750ml"),
  );

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Use server-side pagination — products are already the current page
  const currentProducts = products;

  return (
    <div className="min-h-screen bg-fh-gray pt-12 pb-32 md:pb-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-fh-navy mb-2">
              Shop All Products
            </h1>
            <p className="text-gray-500">
              {isSearching
                ? `Search results for "${activeSearchQuery}" — ${products.length} ${products.length === 1 ? "result" : "results"}`
                : `Showing ${products.length} ${products.length === 1 ? "result" : "results"}`}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="w-full h-10 pl-9 pr-4 rounded-md border border-gray-200 focus:outline-none focus:border-fh-orange focus:ring-1 focus:ring-fh-orange text-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              className="h-10 px-5 bg-fh-orange hover:bg-fh-orangeHover text-white font-medium rounded-md text-sm transition-colors whitespace-nowrap"
            >
              Search
            </button>
            {isSearching && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveSearchQuery("");
                  setIsSearching(false);
                  setCurrentPage(1);
                  fetchProducts(1);
                }}
                className="h-10 px-3 border border-gray-200 text-gray-500 font-medium rounded-md text-sm transition-colors hover:bg-gray-50 whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white border border-gray-100 rounded-xl p-6 sticky top-24 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-lg mb-6 pb-4 border-b border-gray-100 text-fh-navy">
                <Filter className="w-5 h-5 text-fh-orange" /> Filters
              </div>

              <div className="mb-8">
                <h3 className="font-semibold mb-4 text-fh-navy">Categories</h3>
                <div className="space-y-3">
                  {[
                    "Carbonated Drinks",
                    "Non-Carbonated Drinks",
                    "Water",
                    "Juices",
                    "Wines & Spirits",
                    "Snacks",
                  ].map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="w-4 h-4 rounded border-gray-300 text-fh-orange focus:ring-fh-orange"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-fh-navy transition-colors">
                        {cat}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                {/* Price range filter removed as requested */}
              </div>

              <button
                onClick={() => setSelectedCategories([])}
                className="w-full h-10 bg-fh-orange hover:bg-fh-orangeHover text-white font-medium rounded-md text-sm transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Best Sellers Ribbon */}
            {!isLoading && bestSellers.length > 0 && isRibbonVisible && (
              <motion.div
                drag
                dragMomentum={false}
                dragConstraints={{
                  left: 0,
                  right: window.innerWidth - 300,
                  top: -window.innerHeight + 200,
                  bottom: 0,
                }}
                className="fixed bottom-24 left-4 md:bottom-4 z-40 w-72 rounded-lg p-0.5 shadow-[0_0_15px_rgba(234,179,8,0.3)] border border-yellow-300 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 animate-pulse-slow cursor-move"
              >
                <div className="bg-white/95 backdrop-blur-sm rounded-md p-3 relative pointer-events-auto">
                  <button
                    onClick={() => setIsRibbonVisible(false)}
                    className="absolute top-1.5 right-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1.5 mb-2 text-yellow-600 font-bold uppercase tracking-wider text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-ping"></span>
                    Best Sellers
                  </div>
                  <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto custom-scrollbar pr-1">
                    {bestSellers.map((product) => (
                      <div
                        key={`bs-${product.id}`}
                        className="flex items-center gap-2 bg-white p-1.5 rounded border border-yellow-100 shadow-sm"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded bg-fh-gray/30 p-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-xs font-bold text-fh-navy line-clamp-2 leading-tight"
                            title={product.name}
                          >
                            {product.name}
                          </div>
                          <div className="text-[10px] text-fh-orange font-bold mt-0.5">
                            GHS {product.price.toFixed(2)}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            addItem({
                              id: product.id.toString(),
                              name: product.name,
                              price: product.price,
                              quantity: 1,
                              image: product.image,
                            });
                          }}
                          className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white p-1.5 rounded transition-all shadow-sm shrink-0"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse"
                  >
                    <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2 mt-4"></div>
                  </div>
                ))}
              </div>
            ) : currentProducts.length === 0 ? (
              <div className="flex justify-center items-center h-64 text-gray-500">
                No products found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentProducts.map((product) => {
                  const isBestSeller =
                    product.name.toLowerCase().includes("jojo energy") ||
                    product.name.toLowerCase().includes("beyti mango juice");

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg transition-shadow group flex flex-col h-full relative"
                    >
                      {isBestSeller && (
                        <div className="absolute -top-3 -right-3 z-20 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse uppercase tracking-wider border border-yellow-300/50 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                          Best Seller
                        </div>
                      )}
                      <div
                        className="aspect-square bg-fh-gray/50 rounded-lg mb-4 relative overflow-hidden flex items-center justify-center cursor-pointer"
                        onClick={() => {
                          addItem({
                            id: product.id.toString(),
                            name: product.name,
                            price: product.price,
                            quantity: 1,
                            image: product.image,
                          });
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-fh-navy/5 backdrop-blur-sm z-10">
                          <button className="flex items-center justify-center gap-2 h-10 px-4 bg-fh-orange hover:bg-fh-orangeHover text-white rounded-md text-sm font-medium transition-colors">
                            <ShoppingCart className="w-4 h-4" /> Add
                          </button>
                        </div>
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover p-2"
                          />
                        ) : (
                          <Package className="w-16 h-16 text-gray-300" />
                        )}
                      </div>
                      <div className="flex flex-col flex-1">
                        <div className="text-xs text-fh-orange font-medium mb-1">
                          {product.category}
                        </div>
                        <h3 className="font-bold text-fh-navy mb-1 line-clamp-2 flex-1 group-hover:text-fh-orange transition-colors cursor-pointer">
                          {product.name}
                        </h3>

                        <div className="mt-auto pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-lg text-fh-navy">
                              GHS {product.price.toFixed(2)}
                            </span>
                            <div className="relative group/tooltip">
                              <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-fh-orange transition-colors">
                                Bulk Pricing <ChevronDown className="w-3 h-3" />
                              </button>
                              <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-gray-100 shadow-xl rounded-lg p-3 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-20">
                                <div className="text-xs font-semibold text-fh-navy mb-2 border-b border-gray-100 pb-1">
                                  Wholesale Tiers
                                </div>
                                <div className="space-y-1 text-xs">
                                  <button
                                    onClick={() => {
                                      addItem({
                                        id: product.id.toString(),
                                        name: product.name,
                                        price: product.price,
                                        quantity: 1,
                                        image: product.image,
                                      });
                                    }}
                                    className="w-full flex justify-between hover:text-fh-orange transition-colors"
                                  >
                                    <span>1-500:</span>{" "}
                                    <span>GHS {product.price.toFixed(2)}</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      addItem({
                                        id: product.id.toString(),
                                        name: product.name,
                                        price: product.price,
                                        quantity: 501,
                                        image: product.image,
                                      });
                                    }}
                                    className="w-full flex justify-between hover:text-fh-orange transition-colors"
                                  >
                                    <span>501-3,000:</span>{" "}
                                    <span>
                                      GHS {(product.price * 0.95).toFixed(2)}
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      addItem({
                                        id: product.id.toString(),
                                        name: product.name,
                                        price: product.price,
                                        quantity: 3001,
                                        image: product.image,
                                      });
                                    }}
                                    className="w-full flex justify-between hover:text-fh-orange transition-colors"
                                  >
                                    <span>3,001-5,000:</span>{" "}
                                    <span>
                                      GHS {(product.price * 0.9).toFixed(2)}
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      addItem({
                                        id: product.id.toString(),
                                        name: product.name,
                                        price: product.price,
                                        quantity: 5001,
                                        image: product.image,
                                      });
                                    }}
                                    className="w-full flex justify-between hover:text-fh-orange transition-colors"
                                  >
                                    <span>5,001-10,000:</span>{" "}
                                    <span>
                                      GHS {(product.price * 0.88).toFixed(2)}
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      addItem({
                                        id: product.id.toString(),
                                        name: product.name,
                                        price: product.price,
                                        quantity: 10001,
                                        image: product.image,
                                      });
                                    }}
                                    className="w-full flex justify-between font-medium text-fh-orange pt-1 mt-1 border-t border-gray-50 hover:opacity-80 transition-opacity"
                                  >
                                    <span>&gt;10,000:</span>{" "}
                                    <span>Apply for voucher</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination stays visible on mobile as a fixed bar so 8 tall cards
                and the best-sellers ribbon cannot hide Previous/Next. */}
            {!isLoading && (allProducts.length > 0 || currentPage > 1) && (
              <div className="fixed inset-x-0 bottom-0 z-50 md:static md:mt-12 md:bottom-auto">
                <div className="flex justify-center items-center gap-2 bg-white/95 md:bg-transparent backdrop-blur md:backdrop-blur-none border-t md:border-0 border-gray-200 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.08)] md:shadow-none">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="h-11 px-4 rounded-md border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  <div className="flex items-center gap-1 overflow-x-auto max-w-[50vw] md:max-w-none no-scrollbar">
                    {Array.from({
                      length: Math.min(
                        7,
                        Math.max(
                          1,
                          totalPages - Math.floor((currentPage - 1) / 7) * 7,
                        ),
                      ),
                    }).map((_, i) => {
                      const pageNum =
                        Math.floor((currentPage - 1) / 7) * 7 + i + 1;
                      if (pageNum > totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`h-11 min-w-11 px-3 rounded-md text-sm font-medium transition-colors shrink-0 ${
                            currentPage === pageNum
                              ? "bg-fh-orange text-white border border-fh-orange"
                              : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, Math.max(totalPages, prev + 1)),
                      )
                    }
                    disabled={currentPage >= totalPages}
                    className="h-11 px-4 rounded-md border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
