import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createProperty, deleteProperty, getProperties } from '../services/propertyServices';
import { addFavourite, getFavourites, removeFavourite } from '../services/favouriteServices';
import type { Favourite, Property } from '../types';

type AdminFormData = {
    id: string;
    title: string;
    image_file: File | null;
    location: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    total_area: number;
};

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const isAdmin = user?.role === 'admin';
    const [activeTab, setActiveTab] = useState<'properties' | 'add' | 'favorites'>('properties');
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [properties, setProperties] = useState<Property[]>([]);
    const [favourites, setFavourites] = useState<Favourite[]>([]);
    const [busyFavouritePropertyId, setBusyFavouritePropertyId] = useState('');
    const [busyDeletePropertyId, setBusyDeletePropertyId] = useState('');
    const [adminSubmitting, setAdminSubmitting] = useState(false);
    const [adminForm, setAdminForm] = useState<AdminFormData>({
        id: `PROP-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
        title: '',
        image_file: null,
        location: '',
        price: 0,
        bedrooms: 0,
        bathrooms: 0,
        total_area: 0
    });

    async function loadProperties() {
        try {
            const propertiesResponse = await getProperties();
            setProperties(propertiesResponse.data || []);
        } catch (requestError: any) {
            if (requestError?.response?.status === 401) {
                logout();
            }
        }
    }

    async function loadFavourites() {
        try {
            const favouritesResponse = await getFavourites();
            setFavourites(favouritesResponse.data || []);
        } catch (requestError: any) {
            if (requestError?.response?.status === 401) {
                logout();
            }
        }
    }

    useEffect(() => {
        void loadFavourites();
    }, []);

    useEffect(() => {
        void loadProperties();
    }, []);

    async function toggleFavourite(propertyId: string, isFavourite: boolean) {
        setBusyFavouritePropertyId(propertyId);

        try {
            if (isFavourite) {
                await removeFavourite(propertyId);
            } else {
                await addFavourite(propertyId);
            }

            await loadFavourites();
        } catch {
            // Ignore small errors for now to keep UI simple.
        } finally {
            setBusyFavouritePropertyId('');
        }
    }

    async function handleCreateProperty() {
        setAdminSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('title', adminForm.title.trim());
            formData.append('location', adminForm.location.trim());
            formData.append('price', adminForm.price.toString());
            formData.append('bedrooms', adminForm.bedrooms.toString());
            formData.append('bathrooms', adminForm.bathrooms.toString());
            formData.append('total_area', adminForm.total_area.toString());
            
            if (adminForm.image_file) {
                formData.append('image', adminForm.image_file);
            }

            await createProperty(formData);

            setAdminForm({
                id: generatePropertyId(),
                title: '',
                image_file: null,
                location: '',
                price: 0,
                bedrooms: 0,
                bathrooms: 0,
                total_area: 0
            });
            await loadFavourites();
            await loadProperties();
            setActiveTab('properties');
        } catch {
            // Keep form behavior simple.
        } finally {
            setAdminSubmitting(false);
        }
    }

    async function handleDeleteProperty(propertyId: string) {
        setBusyDeletePropertyId(propertyId);

        try {
            await deleteProperty(propertyId);
            await loadProperties();
            await loadFavourites();
        } catch {
            // Keep delete flow simple.
        } finally {
            setBusyDeletePropertyId('');
        }
    }

    const favouritePropertyIds = new Set(favourites.map((item) => item.property_id));

    function generatePropertyId() {
        return `PROP-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
    }

    const favouriteCards: Property[] = favourites.map((item) => ({
        id: item.property_id,
        title: item.title,
        image_url: item.image_url,
        location: item.location,
        price: item.price,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        total_area: item.total_area
    }));

    const shownCards = activeTab === 'favorites' ? favouriteCards : properties;

    function getImageSrc(imageUrl: string) {
        if (!imageUrl) {
            return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=60';
        }

        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:')) {
            return imageUrl;
        }

        if (imageUrl.startsWith('/')) {
            return `${apiBaseUrl}${imageUrl}`;
        }

        return `${apiBaseUrl}/${imageUrl}`;
    }

    return (
        <div className="estate-shell">
            <header className="estate-navbar">
                <div className="estate-brand">
                    <span className="estate-brand-mark" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                            <path d="M9 21v-6h6v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                    </span>
                    <h1>Havenly</h1>
                </div>
                <nav className="estate-nav-links">
                    <button
                        className={activeTab === 'properties' ? 'tab-active' : ''}
                        onClick={() => setActiveTab('properties')}
                    >
                        Properties
                    </button>
                    {isAdmin ? (
                        <button
                            className={activeTab === 'add' ? 'tab-active' : ''}
                            onClick={() => setActiveTab('add')}
                        >
                            Add Property
                        </button>
                    ) : null}
                    <button
                        className={activeTab === 'favorites' ? 'tab-active' : ''}
                        onClick={() => setActiveTab('favorites')}
                    >
                        My Favourites
                    </button>
                </nav>
                <div className="profile-menu-wrap">
                    <button
                        type="button"
                        className="profile-menu-trigger"
                        aria-expanded={isProfileMenuOpen}
                        aria-haspopup="menu"
                        onClick={() => setIsProfileMenuOpen((current) => !current)}
                    >
                        <div className="profile-avatar">{(user?.name || 'A').slice(0, 1).toUpperCase()}</div>
                        <div className="profile-summary">
                            <strong>
                                {user?.name || 'Admin User'}
                            </strong>
                            <span>{user?.role || 'buyer'}</span>
                        </div>
                        <span className="profile-chevron" aria-hidden="true">⌄</span>
                    </button>
                    {isProfileMenuOpen ? (
                        <div className="profile-menu-dropdown" role="menu">
                            <div className="profile-menu-heading">
                                <span className="profile-menu-label">Signed in as</span>
                                <strong>{user?.email || 'admin@example.com'}</strong>
                            </div>
                            <button
                                type="button"
                                className="logout-action"
                                role="menuitem"
                                onClick={() => {
                                    setIsProfileMenuOpen(false);
                                    logout();
                                }}
                            >
                                <span aria-hidden="true">↪</span>
                                Log out
                            </button>
                        </div>
                    ) : null}
                </div>
            </header>

            <main className="estate-main">
                <section className="dashboard-content">
                    {isAdmin && activeTab === 'add' ? (
                        <div className="admin-form-card">
                            <h2>Add New Property</h2>
                            <form
                                className="admin-form"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    void handleCreateProperty();
                                }}
                            >
                                <label htmlFor="admin-title">Title</label>
                                <input
                                    id="admin-title"
                                    type="text"
                                    placeholder="Property Title"
                                    value={adminForm.title}
                                    onChange={(event) =>
                                        setAdminForm((current) => ({ ...current, title: event.target.value }))
                                    }
                                    required
                                    disabled={adminSubmitting}
                                />

                                <label htmlFor="admin-image">Image File</label>
                                <input
                                    id="admin-image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                        setAdminForm((current) => ({ ...current, image_file: event.target.files?.[0] || null }))
                                    }
                                    required
                                    disabled={adminSubmitting}
                                />

                                <label htmlFor="admin-location">Location</label>
                                <input
                                    id="admin-location"
                                    type="text"
                                    placeholder="City or Address"
                                    value={adminForm.location}
                                    onChange={(event) =>
                                        setAdminForm((current) => ({ ...current, location: event.target.value }))
                                    }
                                    required
                                    disabled={adminSubmitting}
                                />

                                <label htmlFor="admin-price">Price</label>
                                <input
                                    id="admin-price"
                                    type="number"
                                    min={1}
                                    step={1}
                                    placeholder="100000"
                                    value={adminForm.price || ''}
                                    onChange={(event) =>
                                        setAdminForm((current) => ({
                                            ...current,
                                            price: Number(event.target.value)
                                        }))
                                    }
                                    required
                                    disabled={adminSubmitting}
                                />

                                <label htmlFor="admin-bedrooms">Bedrooms</label>
                                <input
                                    id="admin-bedrooms"
                                    type="number"
                                    min={1}
                                    step={1}
                                    placeholder='2'
                                    value={adminForm.bedrooms || ''}
                                    onChange={(event) =>
                                        setAdminForm((current) => ({
                                            ...current,
                                            bedrooms: Number(event.target.value)
                                        }))
                                    }
                                    required
                                    disabled={adminSubmitting}
                                />

                                <label htmlFor="admin-bathrooms">Bathrooms</label>
                                <input
                                    id="admin-bathrooms"
                                    type="number"
                                    min={1}
                                    step={1}
                                    placeholder='1'
                                    value={adminForm.bathrooms || ''}
                                    onChange={(event) =>
                                        setAdminForm((current) => ({
                                            ...current,
                                            bathrooms: Number(event.target.value)
                                        }))
                                    }
                                    required
                                    disabled={adminSubmitting}
                                />

                                <label htmlFor="admin-area">Total Area (sq ft)</label>
                                <input
                                    id="admin-area"
                                    type="number"
                                    min={1}
                                    step={1}
                                    placeholder='1000'
                                    value={adminForm.total_area || ''}
                                    onChange={(event) =>
                                        setAdminForm((current) => ({
                                            ...current,
                                            total_area: Number(event.target.value)
                                        }))
                                    }
                                    required
                                    disabled={adminSubmitting}
                                />

                                <button type="submit" disabled={adminSubmitting}>
                                    {adminSubmitting ? 'Adding...' : 'Add Property'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <>
                            <div className="dashboard-title">
                                <div>
                                    <p className="dashboard-eyebrow">Your collection</p>
                                    <h2>{activeTab === 'favorites' ? 'My Favourites' : 'Properties'}</h2>
                                    <p>Welcome back, {user?.name || 'Buyer'}. Find a place that feels like home.</p>
                                </div>
                                <div className="dashboard-stat">
                                    <strong>{shownCards.length}</strong>
                                    <span>{activeTab === 'favorites' ? 'Saved homes' : 'Available homes'}</span>
                                </div>
                            </div>

                            {activeTab !== 'add' ? (
                                <>
                                    <div className="property-grid">
                                        {shownCards.map((property) => {
                                            const isFavourite = favouritePropertyIds.has(property.id);
                                            const isBusy = busyFavouritePropertyId === property.id;
                                            const isDeleting = busyDeletePropertyId === property.id;

                                            return (
                                                <article key={property.id} className="property-card">
                                                    <img
                                                        src={getImageSrc(property.image_url)}
                                                        alt={property.title}
                                                        className="property-image"
                                                        loading="lazy"
                                                        onError={(event) => {
                                                            event.currentTarget.src =
                                                                'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=60';
                                                        }}
                                                    />
                                                    <div className="property-body">
                                                        {isFavourite ? <span className="badge-favourite">Favourite</span> : null}
                                                        <h3 className="property-title">{property.title}</h3>
                                                        <p className="property-location">{property.location}</p>
                                                        <p className="property-price">NPR {Number(property.price).toLocaleString()}</p>
                                                        <p className="property-details">
                                                            {property.bedrooms ?? 0} Bed Room . {property.bathrooms ?? 0} Bath Room . {property.total_area ?? 0} sq ft
                                                        </p>
                                                        <div className="property-actions">
                                                            {isAdmin ? (
                                                                <div className="admin-actions">
                                                                    <button
                                                                        onClick={() => void toggleFavourite(property.id, isFavourite)}
                                                                        disabled={isBusy}
                                                                    >
                                                                        {isBusy ? 'Updating...' : isFavourite ? 'Unlike' : 'Like'}
                                                                    </button>
                                                                    <button
                                                                        className="button-danger"
                                                                        onClick={() => void handleDeleteProperty(property.id)}
                                                                        disabled={isDeleting}
                                                                    >
                                                                        {isDeleting ? 'Removing...' : 'Delete'}
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    className="like-button-full"
                                                                    onClick={() => void toggleFavourite(property.id, isFavourite)}
                                                                    disabled={isBusy}
                                                                >
                                                                    {isBusy ? 'Updating...' : isFavourite ? 'Unlike' : 'Like'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>

                                    {shownCards.length === 0 ? (
                                        <div className="empty-state">
                                            <div className="empty-state-icon" aria-hidden="true">
                                                <svg viewBox="0 0 24 24" fill="none">
                                                    <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                                    <path d="M8 21v-6h8v6M8 11h.01M12 11h.01M16 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                </svg>
                                            </div>
                                            <h3>{activeTab === 'favorites' ? 'Your shortlist is waiting.' : 'Your marketplace is ready.'}</h3>
                                            <p>{activeTab === 'favorites' ? 'Save a home you love and it will appear here.' : isAdmin ? 'Add your first property to start building the collection.' : 'New properties will appear here when they become available.'}</p>
                                            {isAdmin && activeTab !== 'favorites' ? (
                                                <button type="button" onClick={() => setActiveTab('add')}>Add your first property <span aria-hidden="true">→</span></button>
                                            ) : null}
                                        </div>
                                    ) : null}
                                </>
                            ) : null}

                        </>
                    )}
                </section>
            </main>
        </div>
    );
}
