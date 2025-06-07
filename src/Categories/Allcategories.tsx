import React, { useEffect, useState } from "react";

interface Resource {
  id: number;
  userId: number;
  categoryId: number;
  name: string;
  description: string;
  media: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: number;
  name: string;
  image: string;
  resources: Resource[];
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("https://findcourse.net.uz/api/categories")
      .then(async (res) => {
        if (!res.ok) throw new Error("Kategoriya ma'lumotlari olinmadi");
        return res.json();
      })
      .then((json) => {
        setCategories(json.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Xatolik yuz berdi");
        setLoading(false);
      });
  }, []);

  const allResources: Resource[] = categories.flatMap((c) => c.resources);

  const filteredResources = (selectedCategory
  ? selectedCategory.resources
  : allResources
).filter((res) =>
  res.name.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
  res.description.toLowerCase().startsWith(searchTerm.toLowerCase())
);



  const handleCategoryClick = (category: Category | null) => {
    setSelectedCategory(category);
  };

  return (
    <div className="container mx-auto mt-10 px-4">
      <div className="flex justify-center mb-6">
        <input type="text" placeholder="Resurs nomi bo'yicha qidirish..." className="w-full m-3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && (
        <div className="flex justify-center my-6">
          <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
      )}

      {error && <p className="text-red-600 text-center my-4">{error}</p>}

      {!loading && !error && (
        <>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className={`w-44 cursor-pointer border rounded-lg overflow-hidden transition-all hover:shadow-lg ${
                selectedCategory === null ? "border-blue-500" : "border-gray-300"
              }`}
              onClick={() => handleCategoryClick(null)}>
              <div className="bg-gray-100 h-full flex items-center justify-center text-center font-semibold">
                Barchasi resurslar
              </div>
            </div>

            {categories.map((category) => (
              <div key={category.id} className={`w-44 cursor-pointer border rounded-lg overflow-hidden transition-all hover:shadow-lg ${
                  selectedCategory?.id === category.id
                    ? "border-blue-500"
                    : "border-gray-300"
                }`}
                onClick={() => handleCategoryClick(category)}
              >
                <img src="/res.jpg" alt="#" className="w-full h-24 object-cover"/>
                <div className="p-2 text-center font-semibold">{category.name}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.length > 0 ? (
              filteredResources.map((resource) => (
                <div key={resource.id} className="bg-gray-100 p-4 rounded-lg shadow hover:shadow-md transition">
                  <img src={resource.image} alt={resource.name} className="h-40 w-full object-cover rounded mb-3"/>
                  <h3 className="text-lg font-bold">{resource.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {resource.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Oldindan ko'rish</span>
                    <a href={resource.media} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-4 py-1 text-sm rounded hover:bg-blue-700">
                      Yuklab olish
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 col-span-full">
                Hech qanday resurs topilmadi.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CategoriesPage;
