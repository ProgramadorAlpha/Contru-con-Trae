import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X, Clock, Save, ChevronDown, ChevronUp, FileText, Eye, EyeOff } from 'lucide-react';
import { documentSearchService, SearchOptions, SearchResult } from '../../lib/documentSearchService';

interface AdvancedSearchProps {
  documents?: any[];
  onSearchResults?: (results: any[]) => void;
  categories?: string[];
  types?: string[];
  projects?: any[];
  isLoading?: boolean;
  onClear?: () => void;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  documents,
  onSearchResults,
  categories,
  types,
  projects,
  isLoading = false
}) => {
  const [query, setQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    query: '',
    searchInContent: true,
    searchInMetadata: true,
    filters: {},
    sortBy: 'relevance',
    sortOrder: 'desc'
  });
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [savedFilters, setSavedFilters] = useState<Array<{ name: string; options: SearchOptions }>>([]);
  const [showSavedFilters, setShowSavedFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Cargar historial y filtros guardados
  useEffect(() => {
    setSearchHistory(documentSearchService.getSearchHistory());
    setSavedFilters(documentSearchService.getSavedFilters());
  }, []);

  // Actualizar sugerencias
  useEffect(() => {
    if (query.trim() && showSuggestions) {
      const newSuggestions = documentSearchService.getSearchSuggestions(query, documents);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [query, documents, showSuggestions]);

  // Realizar búsqueda
  const performSearch = useCallback(async () => {
    if (!onSearchResults) return;
    
    if (!query.trim() && Object.keys(searchOptions.filters || {}).length === 0) {
      onSearchResults((documents || []).map(doc => ({
        document: doc,
        score: 1,
        highlights: { content: [], metadata: [] },
        matchedFields: []
      })));
      return;
    }

    setIsSearching(true);
    try {
      const options = {
        ...searchOptions,
        query: query
      };
      
      const results = await documentSearchService.search(documents || [], options);
      onSearchResults(results);
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      onSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query, searchOptions, documents, onSearchResults]);

  // Búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [performSearch]);

  // Manejar cambios en filtros
  const updateFilter = (filterType: string, value: any) => {
    setSearchOptions(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterType]: value
      }
    }));
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearchOptions(prev => ({
      ...prev,
      filters: {}
    }));
    setQuery('');
  };

  // Guardar filtro actual
  const saveCurrentFilter = () => {
    const name = prompt('Nombre para el filtro:');
    if (name) {
      documentSearchService.saveFilter(name, searchOptions);
      setSavedFilters(documentSearchService.getSavedFilters());
    }
  };

  // Aplicar filtro guardado
  const applySavedFilter = (filter: { name: string; options: SearchOptions }) => {
    setSearchOptions(filter.options);
    setQuery(filter.options.query || '');
    setShowSavedFilters(false);
  };

  // Seleccionar sugerencia
  const selectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      {/* Barra de búsqueda principal */}
      <div className="relative">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Buscar documentos por nombre, contenido, categoría..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {/* Indicadores de búsqueda */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              {isSearching && (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              )}
              
              {/* Toggle búsqueda en contenido */}
              <button
                type="button"
                onClick={() => setSearchOptions(prev => ({ ...prev, searchInContent: !prev.searchInContent }))}
                className={`p-1 rounded ${searchOptions.searchInContent ? 'text-blue-500' : 'text-gray-400'}`}
                title="Buscar en contenido del documento"
              >
                {searchOptions.searchInContent ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-5 h-5" />
            <span>Filtros</span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <button
            onClick={saveCurrentFilter}
            className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            title="Guardar filtro actual"
          >
            <Save className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowSavedFilters(!showSavedFilters)}
            className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 relative"
            title="Filtros guardados"
          >
            <Clock className="w-5 h-5" />
            {savedFilters.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {savedFilters.length}
              </span>
            )}
          </button>
        </div>

        {/* Sugerencias */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => selectSuggestion(suggestion)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
              >
                <FileText className="w-4 h-4 text-gray-400" />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filtros guardados */}
      {showSavedFilters && (
        <div className="mt-2 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">Filtros Guardados</h3>
          {savedFilters.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay filtros guardados</p>
          ) : (
            <div className="space-y-2">
              {savedFilters.map((filter, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                  <span className="font-medium">{filter.name}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => applySavedFilter(filter)}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      Aplicar
                    </button>
                    <button
                      onClick={() => {
                        documentSearchService.deleteFilter(filter.name);
                        setSavedFilters(documentSearchService.getSavedFilters());
                      }}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Categorías */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categorías</label>
              <select
                multiple
                value={searchOptions.filters?.category || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  updateFilter('category', selected);
                }}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                size={3}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Tipos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipos</label>
              <select
                multiple
                value={searchOptions.filters?.type || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  updateFilter('type', selected);
                }}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                size={3}
              >
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Proyectos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Proyectos</label>
              <select
                multiple
                value={searchOptions.filters?.project || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  updateFilter('project', selected);
                }}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                size={3}
              >
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>

            {/* Ordenamiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
              <select
                value={searchOptions.sortBy}
                onChange={(e) => setSearchOptions(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="relevance">Relevancia</option>
                <option value="date">Fecha</option>
                <option value="name">Nombre</option>
                <option value="size">Tamaño</option>
              </select>
              
              <div className="mt-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={searchOptions.sortOrder === 'asc'}
                    onChange={(e) => setSearchOptions(prev => ({ 
                      ...prev, 
                      sortOrder: e.target.checked ? 'asc' : 'desc' 
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm">Ascendente</span>
                </label>
              </div>
            </div>
          </div>

          {/* Opciones de búsqueda */}
          <div className="mt-4 flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={searchOptions.searchInContent}
                onChange={(e) => setSearchOptions(prev => ({ ...prev, searchInContent: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm">Buscar en contenido del documento (OCR)</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={searchOptions.searchInMetadata}
                onChange={(e) => setSearchOptions(prev => ({ ...prev, searchInMetadata: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm">Buscar en metadatos</span>
            </label>
          </div>

          {/* Botones de acción */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Limpiar filtros
              </button>
              
              <button
                onClick={saveCurrentFilter}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Guardar filtro
              </button>
            </div>

            <div className="text-sm text-gray-500">
              {Object.keys(searchOptions.filters || {}).length} filtros activos
            </div>
          </div>
        </div>
      )}
    </div>
  );
};