<template>
  <main>
    <h1>Edit Preferences</h1>
    <p style="text-align: center;">
      This data is used to recommend content to help you find better products! All questions are optional.
    </p>
    <button @click="handleSave" class="btn-save">Save Preferences</button>


    <section v-if="!isLoading">
    <div v-if="isLoggedIn" class="preferences-grid">
      <div>
        <AgeInput :value="age" @update:age="updateAge" />
        <LocationInput :value="location" @update:location="updateLocation" />
        <LookingFor :value="lookingFor" @update:lookingFor="updateLookingFor" />
      </div>
      <UserInterestComponent 
        :value="userInterests" 
        :suggestedInterests="suggestedInterests" 
        @update:selectedInterests="updateUserInterests" 
      />
      <CompanyInterestComponent 
        :initialCompanies="suggestedCompanies" 
        :initialSelectedCompanies="favoriteCompanies" 
        @update:selectedCompanies="updatefavoriteCompanies" 
      />
      <DoNotShow :value="doNotShowList" @update:doNotShow="updateDoNotShowList" />
    </div>

  <!-- v-else directly adjacent to the v-if above -->
  <div v-else>
    Must have an account to modify Preferences!
  </div>
  
</section>
  </main>
</template>

<script setup lang="ts">
import AgeInput from "@/components/Preferences/AgeInput.vue";
import CompanyInterestComponent from "@/components/Preferences/CompanyInterestComponent.vue";
import DoNotShow from "@/components/Preferences/DoNotShow.vue";
import LocationInput from "@/components/Preferences/LocationInput.vue";
import LookingFor from "@/components/Preferences/LookingFor.vue";
import UserInterestComponent from "@/components/Preferences/UserInterestComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onMounted, ref } from 'vue';

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const age = ref<number | null>(null);
const location = ref<string>('');
const lookingFor = ref<string>('');
const userInterests = ref<string[]>([]);
const favoriteCompanies = ref<string[]>([]);
const doNotShowList = ref<string[]>([]);

const availableCompanies = [
  'Nike', 'Adidas', 'Puma', 'Under Armour', 'H&M', 'Zara', 'Gucci', 'Louis Vuitton', 
  'Apple', 'Samsung', 'Coca-Cola', 'Pepsi', 'Starbucks', 'McDonald\'s', 'Subway', 
  'Amazon', 'IKEA', 'Walmart', 'Target', 'Best Buy', 'Home Depot', 'Lowe\'s', 
  'Sephora', 'Ulta Beauty', 'L\'Oréal', 'Chanel', 'Dior', 'Microsoft', 'Netflix', 
  'Disney', 'Sony', 'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz'
];

const availableInterests = [
  'Sports', 'Movies', 'Music', 'Gaming', 'Technology', 'Art', 'Fashion', 'Fitness',
  'Travel', 'Cooking', 'Politics', 'Books', 'Celebrities', 'Health & Wellness', 
  'Yoga', 'Meditation', 'Hiking', 'Biking', 'Photography', 'Cars', 'Luxury', 
  'Interior Design', 'DIY Projects', 'Gardening', 'Fishing', 'Camping', 'Surfing',
  'Skiing', 'Snowboarding', 'Home Improvement', 'Business', 'Finance', 'Investing'
];

const isLoading = ref(true);

const suggestedInterests = ref<string[]>([]);
const suggestedCompanies = ref<string[]>([]);

const fetchPreferences = async () => {
  try {
    const response = await fetch('/api/preferences', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.preferences!==null){
        age.value = data.preferences.age || null;
        location.value = data.preferences.location || '';
        lookingFor.value = data.preferences.lookingFor || '';
        userInterests.value = data.preferences.interests || [];
        favoriteCompanies.value = data.preferences.favoriteCompanies || [];
        doNotShowList.value = data.preferences.doNotShow || [];
      }
      if (userInterests.value.length === 0) {
        suggestedInterests.value = availableInterests;
      } else {
        suggestedInterests.value = Array.from(new Set([...userInterests.value, ...availableInterests]));
      }

      if (favoriteCompanies.value.length === 0) {
        suggestedCompanies.value = availableCompanies;
      } else {
        suggestedCompanies.value = Array.from(new Set([...favoriteCompanies.value, ...availableCompanies]));
      }
      
    } else {
      console.error('Failed to fetch preferences');
    }
  } catch (error) {
    console.error('Error fetching preferences:', error);
  } finally {
    isLoading.value = false; 
  }
};

onMounted(async () => {
  if (isLoggedIn.value) {
    await fetchPreferences();
    console.log(suggestedCompanies);
    console.log(suggestedCompanies.value);
  } else {
    isLoading.value = false;
  }
});

const updateAge = (value: number | null) => {
  age.value = value;
};

const updateLocation = (value: string) => {
  location.value = value;
};

const updateLookingFor = (value: string) => {
  lookingFor.value = value;
};

const updateUserInterests = (value: string[]) => {
  userInterests.value = value;
};

const updatefavoriteCompanies = (value: string[]) => {
  favoriteCompanies.value = value;
};

const updateDoNotShowList = (value: string[]) => {
  doNotShowList.value = value;
};

const handleSave = async () => {
  try {
    const createResponse = await fetch('/api/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!createResponse.ok) {
      console.log('User profile might already exist, proceeding with updates.');
    }

    if (age.value !== null) {
      await saveUserAge(age.value);
    }

    if (location.value) {
      await saveUserLocation(location.value);
    }
    if (lookingFor.value) {
      await saveUserLookingFor(lookingFor.value);
    }

    if (userInterests.value.length > 0) {
      await saveUserInterests(userInterests.value);
    }

    if (favoriteCompanies.value.length > 0) {
      await saveFavoriteCompanies(favoriteCompanies.value);
    }

    if (doNotShowList.value.length > 0) {
      await saveDoNotShowList(doNotShowList.value);
    }

    console.log('All preferences saved successfully');
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
};

const saveUserAge = async (newAge: number) => {
  const response = await fetch(`/api/preferences/age`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newAge }),
  });

  if (!response.ok) {
    throw new Error('Failed to update age');
  }
};

const saveUserLocation = async (newLocation: string) => {
  const response = await fetch(`/api/preferences/location`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newLocation }),
  });

  if (!response.ok) {
    throw new Error('Failed to update location');
  }
};

const saveUserLookingFor = async (newLookingFor: string) => {
  const response = await fetch(`/api/preferences/looking-for`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newLookingFor }),
  });

  if (!response.ok) {
    throw new Error('Failed to update "Looking For" status');
  }
};

const saveUserInterests = async (newInterests: string[]) => {
  const response = await fetch(`/api/preferences/interests`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newInterests }),
  });

  if (!response.ok) {
    throw new Error('Failed to update interests');
  }
};

const saveFavoriteCompanies = async (newFavoriteCompanies: string[]) => {
  const response = await fetch(`/api/preferences/favorite-companies`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newFavoriteCompanies }), 
  });

  if (!response.ok) {
    throw new Error('Failed to update favorite companies');
  }
};

const saveDoNotShowList = async (newDoNotShowList: string[]) => {
  const response = await fetch(`/api/preferences/do-not-show`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newDoNotShowList }),
  });

  if (!response.ok) {
    throw new Error('Failed to update blocked items');
  }
};
</script>

<style scoped>
h1 {
  text-align: center;
  margin-bottom: 0.5em;
}

p {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 1.5em;
  color: #555;
}

.preferences-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4em;
  padding: 1em;
  max-width: 1200px;
  margin: 0 auto;
}

.btn-save {
  display: block;
  width: 100%;
  max-width: 300px;
  margin: 2em auto 0;
  padding: 0.75em;
  background-color: #69988D;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  text-align: center;
  transition: background-color 0.3s ease;
}

.btn-save:hover {
  background-color: #517A6B;
}
</style>
