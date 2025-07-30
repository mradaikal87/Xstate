import React, { useEffect, useState } from "react";
import styles from "./CountrySection.module.css";

const fetchCountries = async () => {
  const response = await fetch("https://crio-location-selector.onrender.com/countries");
  if (!response.ok) throw new Error("Failed to fetch countries");

  const rawCountries = await response.json();

  const uniqueCountriesSet = new Set();
  const uniqueCountries = [];

  for (const country of rawCountries) {
    const normalized = country.trim().toLowerCase();
    if (!uniqueCountriesSet.has(normalized)) {
      uniqueCountriesSet.add(normalized);
      uniqueCountries.push(country);
    }
  }

  return uniqueCountries;
};

const fetchStates = async (country) => {
  const response = await fetch("https://crio-location-selector.onrender.com/countries");
  if (!response.ok) throw new Error("Failed to fetch countries");

  const allCountries = await response.json();

  const matchingEntries = allCountries.filter(
    (item) => item.trim().toLowerCase() === country.trim().toLowerCase()
  );

  const stateSet = new Set();
  for (const entry of matchingEntries) {
    const res = await fetch(`https://crio-location-selector.onrender.com/country=${entry}/states`);
    if (res.ok) {
      const states = await res.json();
      states.forEach((s) => stateSet.add(s));
    }
  }

  return Array.from(stateSet);
};

const fetchCities = async (country, state) => {
  const response = await fetch(
    `https://crio-location-selector.onrender.com/country=${country}/state=${state}/cities`
  );
  if (!response.ok) throw new Error("Failed to fetch cities");
  return response.json();
};

function CountrySection() {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await fetchCountries();

        const seen = new Set();
        const uniqueCountries = data.filter((country) => {
          const normalized = country.trim().toLowerCase();
          if (seen.has(normalized)) return false;
          seen.add(normalized);
          return true;
        });

        setCountries(uniqueCountries);
      } catch (err) {
        setError(err.message);
      }
    };
    loadCountries();
  }, []);

  useEffect(() => {
    if (!selectedCountry) return;
    const loadStates = async () => {
      try {
        setLoading(true);
        const data = await fetchStates(selectedCountry);
        setStates(data);
        setSelectedState("");
        setCities([]);
        setSelectedCity("");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadStates();
  }, [selectedCountry]);

  useEffect(() => {
    if (!selectedState) return;
    const loadCities = async () => {
      try {
        setLoading(true);
        const data = await fetchCities(selectedCountry, selectedState);
        setCities(data);
        setSelectedCity("");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadCities();
  }, [selectedCountry, selectedState]);

  return (
    <div>
      <h3>Select Location</h3>

      <select
        className={styles.seleceField}
        value={selectedCountry}
        onChange={(e) => setSelectedCountry(e.target.value)}
      >
        <option value="">Select Country</option>
        {countries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>

      <select
        className={styles.seleceField}
        value={selectedState}
        onChange={(e) => setSelectedState(e.target.value)}
        disabled={!selectedCountry || loading}
      >
        <option value="">Select State</option>
        {states.map((state) => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </select>

      <select
        className={styles.seleceField}
        value={selectedCity}
        onChange={(e) => setSelectedCity(e.target.value)}
        disabled={!selectedState || loading}
      >
        <option value="">Select City</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>

      {selectedCountry && selectedState && selectedCity && (
        <p data-testid="selected-location">
          Selected: <strong>{`${selectedCity}, ${selectedState}, ${selectedCountry}`}</strong>
        </p>
      )}
    </div>
  );
}

export default CountrySection;
