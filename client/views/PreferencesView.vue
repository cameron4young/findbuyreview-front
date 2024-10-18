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

// State variables to store data from child components
const age = ref<number | null>(null);
const location = ref<string>('');
const lookingFor = ref<string>('');
const userInterests = ref<string[]>([]);
const companyInterests = ref<string[]>([]);
const doNotShowList = ref<string[]>([]);

// Function to fetch existing preferences
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
      age.value = data.preferences.age || null;
      location.value = data.preferences.location || '';
      lookingFor.value = data.preferences.lookingFor || '';
      userInterests.value = data.preferences.userInterests || [];
      companyInterests.value = data.preferences.companyInterests || [];
      doNotShowList.value = data.preferences.doNotShow || [];
    } else {
      console.error('Failed to fetch preferences');
    }
  } catch (error) {
    console.error('Error fetching preferences:', error);
  }
};

// Call fetchPreferences when the component is mounted
onMounted(() => {
  if (isLoggedIn.value) {
    fetchPreferences();
  }
});

// Event handlers to update state variables
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

const updateCompanyInterests = (value: string[]) => {
  companyInterests.value = value;
};

const updateDoNotShowList = (value: string[]) => {
  doNotShowList.value = value;
};

// Function to handle the save action
const handleSave = async () => {
  try {
    // Attempt to create the user profile
    const createResponse = await fetch('/api/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!createResponse.ok) {
      console.log('User profile might already exist, proceeding with updates.');
    }

    // Step 2: Add each data point one by one
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

    if (companyInterests.value.length > 0) {
      await saveFavoriteCompanies(companyInterests.value);
    }

    if (doNotShowList.value.length > 0) {
      await saveDoNotShowList(doNotShowList.value);
    }

    console.log('All preferences saved successfully');
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
};

// Function to save age
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

// Function to save location
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

// Function to save "Looking For" status
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

// Function to save user interests
const saveUserInterests = async (interests: string[]) => {
  for (const interest of interests) {
    const response = await fetch(`/api/preferences/interests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ interest }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add interest: ${interest}`);
    }
  }
};

// Function to save favorite companies
const saveFavoriteCompanies = async (companies: string[]) => {
  for (const company of companies) {
    const response = await fetch(`/api/preferences/favorite-companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add favorite company: ${company}`);
    }
  }
};

// Function to save "Do Not Show" list
const saveDoNotShowList = async (items: string[]) => {
  for (const item of items) {
    const response = await fetch(`/api/preferences/blocked`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ block: item }),
    });

    if (!response.ok) {
      throw new Error(`Failed to block content: ${item}`);
    }
  }
};
</script>

<template>
  <main>
    <h1>Edit Preferences</h1>
    <p style="text-align: center;">This data is used to recommend content to help you find better products! All questions are optional.</p>

    <section>
      <div v-if="isLoggedIn">
        <AgeInput :value="age" @update:age="updateAge" />
        <LocationInput :value="location" @update:location="updateLocation" />
        <LookingFor :value="lookingFor" @update:lookingFor="updateLookingFor" />
        <UserInterestComponent :value="userInterests" @update:selectedInterests="updateUserInterests" />
        <CompanyInterestComponent :value="companyInterests" @update:selectedCompanies="updateCompanyInterests" />
        <DoNotShow :value="doNotShowList" @update:doNotShow="updateDoNotShowList" />
        <button @click="handleSave" class="btn-save">Save Preferences</button>
      </div>
      <div v-else>
        Must have an account to modify Preferences!
      </div>
    </section>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}

.btn-save {
  display: block;
  width: 100%;
  padding: 0.5em;
  margin-top: 2em;
  background-color: #69988D;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  text-align: center;
}

.btn-save:hover {
  background-color: #517A6B;
}
</style>
