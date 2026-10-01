cat << 'INNER_EOF' > /tmp/handler.js
  const handleGenerateCampaign = async () => {
    if (!name.trim() || !website.trim()) {
      alert("Brand Name and Website URL are required to generate a campaign.");
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: name,
          brandUrl: website,
          numberOfQuestions: questionsCount
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate campaign");
      }
      
      const data = await response.json();
      
      // Save the brand first if it's new
      let currentBrandId = editingBrand?.id;
      if (currentBrandId) {
        updateBrand(currentBrandId, { name, category, description, website });
      } else {
        const newBrand = addBrand({ name, category: category || 'products', description, website, icon: 'Building2' });
        currentBrandId = newBrand.id;
        setEditingBrand(newBrand);
        setIsCreating(false);
      }

      createCampaign({
        title: `${name} AI Generated Survey`,
        description: data.description || `Customer feedback survey for ${name}`,
        category: 'products',
        targetAudience: 'All active platform users',
        estimatedMinutes: Math.ceil(questionsCount * 0.8),
        rewardCoins: questionsCount * 20,
        status: 'active',
        questions: data.questions,
        brandId: currentBrandId
      });
      
      alert("Campaign generated and added to the customer queue successfully!");
    } catch (error) {
      console.error(error);
      alert("An error occurred while generating the campaign. Make sure GEMINI_API_KEY is set in .env");
    } finally {
      setIsGenerating(false);
    }
  };
INNER_EOF

# Extract everything before handleGenerateCampaign
awk '/const handleGenerateCampaign = async \(\) => \{/{exit} {print}' src/components/AdminBrandsTab.tsx > /tmp/top.tsx
# Extract everything after handleGenerateCampaign
awk '/const startEditing = \(brand: Brand\) => \{/{p=1} p' src/components/AdminBrandsTab.tsx > /tmp/bottom.tsx

cat /tmp/top.tsx /tmp/handler.js /tmp/bottom.tsx > src/components/AdminBrandsTab.tsx
