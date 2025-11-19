import { defineStore } from "pinia";
import {
  BaseBeverageType,
  CreamerType,
  SyrupType,
  BeverageType,
} from "../types/beverage";
import tempretures from "../data/tempretures.json";
import db from "../firebase.ts";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  QuerySnapshot,
  QueryDocumentSnapshot,
  onSnapshot,
  query,
  where
} from "firebase/firestore";

export const useBeverageStore = defineStore("BeverageStore", {
  state: () => ({
    temps: tempretures,
    currentTemp: tempretures[0],
    bases: [] as BaseBeverageType[],
    currentBase: null as BaseBeverageType | null,
    syrups: [] as SyrupType[],
    currentSyrup: null as SyrupType | null,
    creamers: [] as CreamerType[],
    currentCreamer: null as CreamerType | null,
    beverages: [] as BeverageType[],
    currentBeverage: null as BeverageType | null,
    currentName: "",

    savedBeverages: [] as BeverageType[],
  }),

  actions: {
    async init() {
      const baseCol = collection(db, "bases");
      const syrupCol = collection(db, "syrups");
      const creamerCol = collection(db, "creamers");

      const baseSnap = await getDocs(baseCol);
      const syrupSnap = await getDocs(syrupCol);
      const creamerSnap = await getDocs(creamerCol);
      
      this.bases = baseSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BaseBeverageType[];
      console.log(this.bases);

      this.syrups = syrupSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SyrupType[];
      console.log(this.syrups);


        this.creamers = creamerSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CreamerType[];
      console.log(this.creamers);

      this.currentBase = this.bases[0] || null;
      this.currentSyrup = this.syrups[0] || null;
      this.currentCreamer = this.creamers[0] || null;

      onSnapshot(collection(db, "beverages"), (snapshot) => {
        this.savedBeverages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BeverageType[];
      });
  },
    async makeBeverage(name: string) {
      if (!this.currentBase || !this.currentCreamer || !this.currentSyrup) {
        return;
      }
      const beverage = {
        name: name,
        base: this.currentBase,
        creamer: this.currentCreamer,
        syrup: this.currentSyrup,
        temp: this.currentTemp
      }
      const newRef = doc(collection(db, "beverages"));
      await setDoc(newRef, beverage);

      console.log("Beverage saved:", beverage);
  },
    async showBeverage(name: string) {
      if (!name) return;
      const beverageCol = collection(db, "beverages");
      const q = query(beverageCol, where("name", "==", name));
      const qs: QuerySnapshot = await getDocs(q);
      if (qs.empty) {
        console.log("No beverage found with name:", name);
        return;
      }

      const docSnap: QueryDocumentSnapshot = qs.docs[0];
      const data = docSnap.data() as BeverageType;

      this.currentName = name;
      this.currentBase = data.base;
      this.currentCreamer = data.creamer;
      this.currentSyrup = data.syrup;
      this.currentTemp = data.temp;
      console.log("Beverage loaded:", data);
    },

    clearBeverages() {
      this.savedBeverages = [];
    },
  },
});
