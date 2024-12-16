<template>
<Header></Header>
<div v-if="song.title">
    <h1>{{ song.title }}  {{ songRating }} <span @click="likeSong">like</span></h1>
    <router-link :to="`/artist/${artistId}`">{{ song.artist }}</router-link>
    <div @mouseup="handleMouseUp" @click="handleClick" v-html="renderedLyrics" class="lyrics__container">
    </div>
    <div v-if="showTooltip" :style="tooltipStyle" class="tooltip">
        <button @click="toggleExplanationInput">Добавить объяснение</button>
        <div v-if="showExplanationInput">
            <textarea v-model="explanationText" class="explanation-input" placeholder="Текст объяснения"></textarea>
            <button @click="addExplanation">Сохранить</button>
        </div>
    </div>
    <div v-if="selectedExplanation" class="explanation-display">
        {{ selectedExplanation.explanation }}
        <button @click="clearExplanation">x</button>
        <textarea v-model="explComment" class="comment-input" placeholder="Добавьте свой комментарий..." @keydown.enter.prevent="addComment" :disabled="!isAuthenticated"></textarea>
        <button @click="addExplComment">Добавить комментарий</button>
        <div v-if="explComments.length != 0" class="comments-display">
            <div v-for="comment in explComments" :key="comment.id" class="comment">
                {{ comment.comment }}
            </div>
        </div>
    </div>
</div>
<div v-else>
    Loading...
</div>
<div class="comment-section">
    <textarea v-model="newComment" class="comment-input" placeholder="Добавьте свой комментарий..." @keydown.enter.prevent="addComment" :disabled="!isAuthenticated"></textarea>
    <button @click="addComment">Добавить комментарий</button>
    <div v-if="comments.length != 0" class="comments-display">
        <div v-for="comment in comments" :key="comment.id" class="comment">
            {{ comment.comment }}
        </div>
    </div>
</div>
<router-view />
</template>

<script>
import {
    ref,
    inject,
    onMounted,
    computed
} from 'vue';
import {
    useRoute
} from 'vue-router';
import {
    fetchSongLyrics,
    uploadExplanation,
    fetchExplanations,
    addUsersComment,
    fetchSongsComments,
    addExplanationComment,
    fetchCommentsForExplanation,
    fetchArtists,
    likeDislikeSong,
    getSongsRatings
} from '../lib/common_methods';
import Header from '../components/header.vue';
export default {
    components: {
        Header
    },
    setup() {
        const isAuthenticated = inject('isAuthenticated');
        const user = inject('user');
        const song = ref({});
        const explanations = ref([]);
        const route = useRoute();
        const songID = route.params.id;
        const showTooltip = ref(false);
        const showExplanationInput = ref(false);
        const tooltipStyle = ref({});
        const explanationStyle = ref({});
        const selectedText = ref('');
        const explanationText = ref('');
        const startIndex = ref(null);
        const endIndex = ref(null);
        const selectedExplanation = ref(null);
        const newComment = ref('');
        const comments = ref([]);
        const explComment = ref('');
        const explComments = ref([]);
        const artistId = ref(0);
        const isLiked = ref(false);
        const songRating = ref(0);
        const fetchRating = async () => {
          try {
            const data = await getSongsRatings(songID);
            songRating.value = data;
          } catch (error) {
            console.error(error);
          }
          
        }
        const likeSong = async () => {
          try {
            if (isAuthenticated.value) {
                const data = await likeDislikeSong(songID, user.value.id);
              isLiked.value = !isLiked.value;
              await fetchRating();
            }
            
          } catch (error) {
            console.error(error);
          }
        }

        const getArtistId = async () => {
            try {
                const data = await fetchArtists();
                console.log(data);
                console.log(song.value.artist);
                artistId.value = data.find(artist => artist.name === song.value.artist).id;
                console.log(artistId.value.id);
            } catch (error) {
                console.log(error);
            }
        }

        const fetchExplanationComments = async (selectedExplanationId) => {
            try {
                const data = await fetchCommentsForExplanation(selectedExplanationId);
                return data;
            } catch (error) {
                console.log(error);
            }

        }

        const addExplComment = async () => {
            try {
                if (explComment.value != '') {
                    const data = await addExplanationComment(user.value.id, explComment.value, selectedExplanation.value.id);
                    console.log(data);
                    const explData = await fetchExplanationComments(selectedExplanation.value.id);
                    explComments.value = explData;
                    explComment.value = '';
                }
            } catch (error) {
                console.error(error);
            }
        }

        const fetch = async () => {
            try {
                const [songData, explanationData] = await Promise.all([
                    fetchSongLyrics(songID),
                    fetchExplanations(songID)
                ]);

                if (songData && songData.length > 0) {
                    song.value = songData[0];
                    getArtistId();
                }
                explanations.value = explanationData || [];
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        onMounted(fetch);
        const toggleExplanationInput = () => {
            showExplanationInput.value = !showExplanationInput.value;
        };

        const addExplanation = async () => {
            console.log(startIndex.value);
            try {
                await uploadExplanation(song.value.id, explanationText.value, startIndex.value, endIndex.value, user.value.id);
                explanationText.value = ''; // Clear the input after saving
                fetch(); // Re-fetch explanations after adding a new one
            } catch (error) {
                console.error('Error uploading explanation:', error);
            }
            showTooltip.value = false;
            showExplanationInput.value = false;
        };

        const createIndexMapping = (lyricsWithBr) => {
            const mapping = [];
            let plainTextIndex = 0;

            for (let i = 0; i < lyricsWithBr.length; i++) {
                if (lyricsWithBr[i] === '<' && lyricsWithBr.slice(i, i + 4).toLowerCase() === '<br>') {
                    // Skip over the <br> tag
                    i += 3;
                } else {
                    mapping[plainTextIndex] = i;
                    plainTextIndex++;
                }
            }

            return mapping;
        };

        const handleMouseUp = () => {
            const selection = window.getSelection();
            let selectedTextValue = selection.toString();

            if (selectedTextValue.length > 0 && isAuthenticated.value) {
                console.log(isAuthenticated);
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                // Calculate start and end indices
                let lyricsText = song.value.lyrics.replace(/<br\s*\/?>/gi, '');
                console.log(lyricsText.length);
                const indexMapping = createIndexMapping(song.value.lyrics);

                const normalizeLineEndings = (text) => text.replace(/\r\n|\r|\n/g, '');
                lyricsText = normalizeLineEndings(lyricsText);
                selectedTextValue = normalizeLineEndings(selectedTextValue);

                console.log(selectedTextValue.length);
                const startIdx = lyricsText.indexOf(selectedTextValue);
                const endIdx = startIdx + selectedTextValue.length - 1;
                const startIdxWithBr = indexMapping[startIdx];
                const endIdxWithBr = indexMapping[endIdx];
                for (let i = 0; i < selectedTextValue.length - 1; i++) {
                    if (selectedTextValue[i] != lyricsText[i]) {
                        console.log(i, selectedTextValue[i], lyricsText[i]);
                    }
                }
                console.log(lyricsText);
                console.log(startIdx);
                // Check for any overlap with existing explanations
                const hasOverlap = explanations.value.some(
                    (ex) => !(endIdxWithBr < ex.idx_start || startIdxWithBr > ex.idx_end)
                );

                if (!hasOverlap) {
                    selectedText.value = selectedTextValue;
                    startIndex.value = startIdxWithBr;
                    endIndex.value = endIdxWithBr;

                    tooltipStyle.value = {
                        position: 'absolute',
                        top: `${rect.bottom + window.scrollY}px`,
                        left: `${rect.left + window.scrollX}px`,
                        display: 'block',
                        zIndex: 1000,
                    };

                    showTooltip.value = true;
                } else {
                    showTooltip.value = false;
                }
            } else {
                showTooltip.value = false;
            }
        };

        const handleClick = async (event) => {
            const target = event.target;

            if (target.classList.contains('highlighted')) {
                const start = target.getAttribute('data-start');
                const end = target.getAttribute('data-end');

                if (start !== null && end !== null) {
                    const explanation = explanations.value.find(
                        (ex) => parseInt(start) >= ex.idx_start && parseInt(end) <= ex.idx_end
                    );
                    if (explanation) {
                        selectedExplanation.value = explanation;
                        const data = await fetchExplanationComments(selectedExplanation.value.id);
                        console.log(data);
                        explComments.value = data;
                    }
                }
            }
        };

        const clearExplanation = () => {
            selectedExplanation.value = null;
            explComments.value = [];
            explComment.value = '';
        };

        const renderedLyrics = computed(() => {
            let result = '';
            const lyrics = song.value.lyrics || '';
            const sortedExplanations = [...explanations.value].sort((a, b) => a.idx_start - b.idx_start);
            let actualIndex = 0;
            let visibleIndex = 0;

            sortedExplanations.forEach(ex => {
                const idx_start = ex.idx_start;
                const idx_end = ex.idx_end;

                while (visibleIndex < idx_start && actualIndex < lyrics.length) {
                    result += lyrics.charAt(actualIndex);
                    actualIndex++;
                    visibleIndex++;
                }

                let highlightText = '';
                while (visibleIndex <= idx_end && actualIndex < lyrics.length) {
                    highlightText += lyrics.charAt(actualIndex);
                    actualIndex++;
                    visibleIndex++;
                }
                if (highlightText) {
                    result += `<span class="highlighted" data-start="${idx_start}" data-end="${idx_end}">${highlightText}</span>`;
                }
            });

            while (actualIndex < lyrics.length) {

                result += lyrics.charAt(actualIndex);
                actualIndex++;
            }

            return result;
        });

        const fetchComments = async () => {
            try {
                const data = await fetchSongsComments(songID);
                comments.value = data;
            } catch (error) {
                console.error(error);
            }
        }

        const addComment = async () => {
            try {
                if (newComment.value = '') {
                    const data = await addUsersComment(song.value.id, user.value.id, newComment.value);
                    newComment.value = '';
                    await fetchComments();
                }

            } catch (error) {
                console.error(error);
            }

        }

        fetchComments();
        fetchRating();
        return {
            isAuthenticated,
            user,
            song,
            explanations,
            selectedExplanation,
            showTooltip,
            showExplanationInput,
            tooltipStyle,
            selectedText,
            explanationText,
            addExplanation,
            handleMouseUp,
            toggleExplanationInput,
            renderedLyrics,
            handleClick,
            clearExplanation,
            newComment,
            addComment,
            comments,
            explComment,
            addExplComment,
            explComments,
            getArtistId,
            artistId,
            likeSong,
            songRating
        };
    },
};
</script>

<style>
.lyrics__container {
    position: relative;
}

.tooltip {
    background-color: #fff;
    border: 1px solid #ccc;
    padding: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    position: absolute;
}

.explanation-input {
    margin-top: 5px;
    display: block;
    width: 100%;
}

.highlighted {
    background-color: yellow;
    cursor: pointer;
}

.highlighted:hover {
    background-color: orange;
}

.explanation-display {
    position: fixed;
    right: 10px;
    top: 50px;
    width: 30%;
    padding: 10px;
    background-color: #f9f9f9;
    border: 1px solid #ccc;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.comment-section {
    margin-top: 100px;
    width: 80%;
    background-color: #f9f9f9;
    padding: 10px;
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
}

.comment-input {
    width: 100%;
    height: 100px;
    margin-bottom: 10px;
    resize: none;
}

.comments-display {
    max-height: 200px;
    overflow-y: auto;
    background-color: #fff;
    padding: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.comment {
    margin-bottom: 5px;
    padding: 5px;
    border-bottom: 1px solid #ddd;
}
</style>
