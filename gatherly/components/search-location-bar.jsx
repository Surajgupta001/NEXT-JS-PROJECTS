/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Loader2 } from "lucide-react";
import { State, City } from "country-state-city";
import { format } from "date-fns";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { createLocationSlug } from "@/lib/location-utils";
import { getCategoryIcon } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export default function SearchLocationBar() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchRef = useRef(null);

    const { data: currentUser, isLoading } = useConvexQuery(
        api.users.getCurrentUser
    );
    const { mutate: updateLocation } = useConvexMutation(
        api.users.completeOnboarding
    );

    const { data: searchResults, isLoading: searchLoading } = useConvexQuery(
        api.search.searchEvents,
        searchQuery.trim().length >= 2 ? { query: searchQuery, limit: 5 } : "skip"
    );

    const indianStates = useMemo(() => State.getStatesOfCountry("IN"), []);

    const [selectedState, setSelectedState] = useState("");
    const [selectedCity, setSelectedCity] = useState("");

    useEffect(() => {
        if (currentUser?.location) {
            setSelectedState(currentUser.location.state || "");
            setSelectedCity(currentUser.location.city || "");
        }
    }, [currentUser, isLoading]);

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    const cities = useMemo(() => {
        if (!selectedState) return [];
        const state = indianStates.find((s) => s.name === selectedState);
        if (!state) return [];
        return City.getCitiesOfState("IN", state.isoCode);
    }, [selectedState, indianStates]);

    const debouncedSetQuery = useRef(
        debounce((value) => setSearchQuery(value), 300)
    ).current;

    const handleSearchInput = (e) => {
        const value = e.target.value;
        debouncedSetQuery(value);
        setShowSearchResults(value.length >= 2);
    };

    const handleEventClick = (slug) => {
        setShowSearchResults(false);
        setSearchQuery("");
        router.push(`/events/${slug}`);
    };

    const handleLocationSelect = async (city, state) => {
        try {
            if (currentUser?.interests && currentUser?.location) {
                await updateLocation({
                    location: { city, state, country: "India" },
                    interests: currentUser.interests,
                });
            }
            const slug = createLocationSlug(city, state);
            router.push(`/explore/${slug}`);
        } catch (error) {
            console.error("Failed to update location:", error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex items-center">
            {/* Search Bar */}
            <div className="relative flex w-full" ref={searchRef}>
                <div className="flex-1">
                    <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search events..."
                        onChange={handleSearchInput}
                        onFocus={() => {
                            if (searchQuery.length >= 2) setShowSearchResults(true);
                        }}
                        className="w-full pl-10 h-9 rounded-l-md rounded-r-none focus-visible:z-10"
                    />
                </div>

                {/* Search Results */}
                {showSearchResults && (
                    <div className="absolute top-full mt-2 w-96 bg-background border rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto">
                        {searchLoading ? (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                            </div>
                        ) : searchResults && searchResults.length > 0 ? (
                            <div className="py-2">
                                <p className="px-4 py-2 text-xs font-semibold text-muted-foreground">
                                    SEARCH RESULTS
                                </p>
                                {searchResults.map((event) => (
                                    <button
                                        key={event._id}
                                        onClick={() => handleEventClick(event.slug)}
                                        className="w-full px-4 py-3 text-left transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="text-2xl mt-0.5">
                                                {getCategoryIcon(event.category)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="mb-1 font-medium line-clamp-1">
                                                    {event.title}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {format(event.startDate, "MMM dd")}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {event.city}
                                                    </span>
                                                </div>
                                            </div>
                                            {event.ticketType === "free" && (
                                                <Badge variant="secondary" className="text-xs">
                                                    Free
                                                </Badge>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>
                )}
            </div>

            {/* State Select */}
            <Select
                value={selectedState}
                onValueChange={(value) => {
                    setSelectedState(value);
                    setSelectedCity("");
                }}
            >
                <SelectTrigger className="w-32 h-9 rounded-none -ml-px focus:z-10">
                    <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                    {/* <SelectItem value="">State</SelectItem> */}
                    {indianStates.map((state) => (
                        <SelectItem key={state.isoCode} value={state.name}>
                            {state.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* City Select */}
            <Select
                value={selectedCity}
                onValueChange={(value) => {
                    setSelectedCity(value);
                    if (value && selectedState) {
                        handleLocationSelect(value, selectedState);
                    }
                }}
                disabled={!selectedState}
            >
                <SelectTrigger className="w-32 h-9 rounded-l-none rounded-r-md -ml-px focus:z-10">
                    <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                    {/* <SelectItem value="">City</SelectItem> */}
                    {cities.map((city) => (
                        <SelectItem key={city.name} value={city.name}>
                            {city.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}