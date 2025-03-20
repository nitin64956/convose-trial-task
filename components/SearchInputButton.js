import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SearchButtonInput = () => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isInputFocused,setIsInputFocused] =useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [defaultResults,setDefaultResults] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const animatedWidth = useRef(new Animated.Value(120)).current;
  const timeoutRef = useRef(null);

  useEffect(() => {
    fetchData("");
  },[]);

  // API call function

  const fetchData = async (query) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://be-v2.convose.com/autocomplete/interests?q=${query}&limit=12&from=0`,{
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-GB,en;q=0.9,en-US;q=0.8,de-DE;q=0.7,de;q=0.6",
            "Authorization": 'Jy8RZCXvvc6pZQUu2QZ2',
            "Connection": "keep-alive"
        }
    });
      const data = await response.json();
      const autocomplete = data.autocomplete;
      setResults(autocomplete);
      setFilteredResults(autocomplete);
      if (!query) {
        setDefaultResults(autocomplete);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle search button click
  const handleSearchPress = () => {
    setIsSearchActive(true);
    Animated.timing(animatedWidth, {
      toValue: 300,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      inputRef.current?.focus();
    });
  };
  
  // Handle search input changes
  const handleSearchChange = (text) => {
    setSearchQuery(text);
    setIsTyping(true);
    
    // Filter existing results immediately while waiting for API
    if (results.length > 0) {
      const filtered = results.filter(item => 
        item.name.toLowerCase().startsWith(text.toLowerCase())
      );
      setFilteredResults(filtered);
    }
    
    // Debounce API call
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchData(text);
      setIsTyping(false);
    }, 1000);

  };
  
  
  // Skeleton loader component
  const SkeletonItem = () => (
    <View style={styles.skeletonItem}>
      <View style={styles.skeletonIcon} />
      <View style={styles.skeletonText} />
    </View>
  );
  
  // Result item component
  const ResultItem = ({ item }) => (
    <TouchableOpacity style={{...styles.resultItem,borderBottomColor:item.color, width:400}} >
      <View style={styles.iconContainer}>
        {item.avatar ? <img style={styles.interestIcon} src={item.avatar}/> : <Ionicons name="bookmark-outline" size={24} color="#888" />}
      </View>
      <Text style={styles.resultText}>{item.name}</Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      
        {isSearchActive && searchQuery.length == 0 && (
        <View style={{ height:'50%',marginBottom:10 }}>
        <FlatList
        inverted={true}
        data={defaultResults}
        renderItem={({ item }) => <ResultItem item={item} />}
        keyExtractor={(item) => item.id.toString()}
        style={styles.resultsList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No data found</Text>
        }
      />
      </View>

      )}
      
      {isSearchActive && searchQuery.length > 0 && (
        <View style={{ height:'50%',marginBottom:10 }}>
          {isLoading && !isTyping ? (
            // Show skeleton loader when loading new results
           
            <FlatList
              data={[1, 2, 3, 4, 5]}
              renderItem={() => <SkeletonItem />}
              keyExtractor={(item) => `skeleton-${item}`}
              style={styles.resultsList}
            />
          ) : (
            // Showing filtered results
            <FlatList
              inverted={true}
              data={filteredResults}
              renderItem={({ item }) => <ResultItem item={item} />}
              keyExtractor={(item) => item.id.toString()}
              style={styles.resultsList}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No data found</Text>
              }
            />
          )}
        </View>
      )}

      {/* Search Btn and Input field */}
      {!isSearchActive ? (
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={handleSearchPress}
        >
          <Ionicons name="add" size={25} color="white" />
          <Text style={styles.searchButtonText}>Interests</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.searchBarContainer}>
          <Animated.View style={[styles.searchBar]}>
            <TextInput
              ref={inputRef}
              style={[styles.input, isInputFocused && styles.inputFocused]}
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder="Add hobbies"
              placeholderTextColor="#888"
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => {
                setResults([]);
                setFilteredResults([]);
                setIsInputFocused(false);
                setIsSearchActive(false);
                setSearchQuery("");
                setFilteredResults([]);}}
            />
          </Animated.View>
        </View>
      )}     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin:'auto',
    position: 'relative',
   
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'center',
    backgroundColor: '#6666ff',
    padding:15,
    paddingLeft: 30,
    paddingRight: 30,
    borderRadius: 20,
    width: '50%',
    marginLeft:'25%',
    position:'fixed'
  },
  searchButtonText: {
    marginLeft: 5,
    color: 'white',
    fontWeight:'bold',
    fontSize: 15,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'space-between',
    backgroundColor: '#f0f0f0',
    padding: 2,
    marginTop:10,
    position:'fixed',
    marginLeft:'5%',
    width:'90%'
  },
  searchIcon: {
    marginLeft: 5,
  },
  interestIcon: {
    height:20,
    width:20
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    margin:'auto',
    width: '80%',
  },

  inputFocused: {
    borderWidth: 0,
    outlineStyle:'none',
    width: '80%',
  },

  resultsList: {
    padding: 5
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  addedText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  emptyText: {
    padding: 15,
    textAlign: 'center',
    color: '#888',
  },
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  skeletonIcon: {
    width: 30,
    height: 30,
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
  },
  skeletonText: {
    marginLeft: 10,
    height: 18,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    flex: 1,
  },
});

export default SearchButtonInput;