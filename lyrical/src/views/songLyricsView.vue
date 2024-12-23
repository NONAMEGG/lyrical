<template>
<Header></Header>
<div v-if="song.title">
    <h1>{{ song.title }}  {{ songRating }} <span @click="likeSong">like</span></h1>
    <router-link :to="`/artist/${artistId}`">{{ song.artist }}</router-link>
    <button v-if="user.role" @click="deleteSong(song.id)">Удалить песню</button>
    <button v-if="user.role" @click="showForm = !showForm">Изменить песню</button>
    <div v-if="showForm">
  <input v-model="songName" type="text" placeholder="Название песни">
  <textarea v-model="lyricsText" class="lyrics-input" placeholder="Текст песни"></textarea>
  <br>
  <textarea v-model="description" class="lyrics-input" placeholder="Описание песни"></textarea>
  <br>
  <button @click="tweakSongData">Сохранить</button>
    </div>
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
        <div v-html="selectedExplanation.explanation" class="explanation_text"></div>
        <button @click="clearExplanation">x</button>
        <button @click="deleteExplanationOnSong">Удалить</button>
        <button @click="setRatingOfSelectedExplanation(selectedExplanation.id, -1)"><</button>
        <button @click="setRatingOfSelectedExplanation(selectedExplanation.id, 0)">{{ selectedExplanationRating }}</button>
        <button @click="setRatingOfSelectedExplanation(selectedExplanation.id, 1)">></button>
        <textarea v-model="explComment" class="comment-input" placeholder="Добавьте свой комментарий..." @keydown.enter.prevent="addComment" :disabled="!isAuthenticated"></textarea>
        <button @click="addExplComment">Добавить комментарий</button>
        <div v-if="explComments.length != 0" class="comments-display">
            <div v-for="comment in explComments" :key="comment.id" class="comment">
                
                <button v-if="comment.user_id === user.id" @click="deleteExplComment(comment.id)">x</button>
                <img :src="comment.profile_icon_path" alt="" style="width: 50px; height: 50px; border-radius: 50%;">
                {{ comment.created_at }}
                {{ comment.username }}
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
            <button v-if="comment.added_by === user.id" @click="deleteSongComment(comment.id)">x</button>
            <img :src="comment.profile_icon_path" alt="" style="width: 50px; height: 50px; border-radius: 50%;">
            {{ comment.created_at }}
            {{ comment.username }}
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
    useRoute, useRouter
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
    getSongsRatings,
    deleteCommentOnSong,
    deleteExplanationComment,
    fetchExplanationRating,
    likeDislikeExplanation,
    deleteUsersSong,
    updateSongData,
    deleteExplanation
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
        const router = useRouter();
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
        const selectedExplanationRating = ref(0);
        const isAlreadyGivenRating = ref(false);
        const showForm = ref(false);
        const lyricsText = ref('');
        const description = ref('');
        const songName = ref('');
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
                console.log(artistId.value);
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
                    for (let i = 0; i < explData.length; i++) {
                        const date = new Date(explData[i].created_at);
            const formattedDate = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} ${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
            explData[i].created_at = formattedDate;
        }
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
    let i = 0;

    while (i < lyricsWithBr.length) {
        if (lyricsWithBr.startsWith('<br>', i)) {
            i += 4;
            // Check if there is another <br> after a newline
            if (lyricsWithBr[i] === '\n') {
                 // Skip the newline character
                if (lyricsWithBr.startsWith('<br>', i+1)) {
                    i++;
                    continue; // Skip to the next loop iteration to catch this <br>
                }
            }
        } else if (lyricsWithBr.startsWith('<br/>', i)) {
            i += 5;
            if (lyricsWithBr[i] === '\n') {
                i++;
                if (lyricsWithBr.startsWith('<br/>', i)) {
                    continue;
                }
            }
        } else if (lyricsWithBr.startsWith('<br />', i)) {
            i += 6;
            if (lyricsWithBr[i] === '\n') {
                i++;
                if (lyricsWithBr.startsWith('<br />', i)) {
                    continue;
                }
            }
        } else {
            mapping[plainTextIndex] = i;
            plainTextIndex++;
            i++;
        }
    }

    return mapping;
};








        const handleMouseUp = () => {
            const selection = window.getSelection();
let selectedTextValue = selection.toString().trim(); // Trim any leading/trailing spaces

if (selectedTextValue.length > 0 && isAuthenticated.value) {
    console.log(isAuthenticated);
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    console.log(song.value.lyrics);
    // Original lyrics with <br> tags
    const lyricsWithBr = song.value.lyrics;
    console.log(lyricsWithBr);
    // Remove <br> tags and normalize spaces
    let lyricsText = lyricsWithBr.replace(/<br\s*\/?>/gi, ' ');

    // Normalize function
    console.log(lyricsText);
    const normalizeText = (text) => text.replace(/\r\n|\r|\n/g, ' ').replace(/\s+/g, ' ').trim();
    console.log(selectedTextValue);
    // Apply normalization
    lyricsText = normalizeText(lyricsText);
    selectedTextValue = normalizeText(selectedTextValue);

    console.log("Normalized Lyrics Text:", lyricsText);
    console.log("Normalized Selected Text:", selectedTextValue);

    // Find start index in normalized lyrics
    const startIdx = lyricsText.indexOf(selectedTextValue);
    console.log(selectedTextValue.length);
    const endIdx = startIdx + selectedTextValue.length - 1;

    console.log("Normalized Start Index:", startIdx, "End Index:", endIdx);

    // Create index mapping from original lyrics
    const indexMapping = createIndexMapping(lyricsWithBr);
    console.log(indexMapping);
    // Check if indices are valid
    if (startIdx >= 0 && endIdx < indexMapping.length) {
        const startIdxWithBr = indexMapping[startIdx];
        const endIdxWithBr = indexMapping[endIdx];

        console.log("Original Start Index with <br>:", startIdxWithBr);
        console.log("Original End Index with <br>:", endIdxWithBr);

        // Detailed character comparison log
        for (let i = 0; i < selectedTextValue.length; i++) {
            if (selectedTextValue[i] !== lyricsWithBr[i + startIdxWithBr]) {
                console.log(i, selectedTextValue[i], lyricsWithBr[i + startIdxWithBr]);
            }
        }
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
        console.error("Selected text not found in normalized lyrics text or index out of bounds.");
        
    }



                // console.log(lyricsText);
                // console.log(startIdx);
                // Check for any overlap with existing explanations
                
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
                        await getRatingOfSelectedExplanation();
                        console.log(data);
                        for (let i = 0; i < data.length; i++) {
                            const date = new Date(data[i].created_at);
            const formattedDate = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} ${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
            data[i].created_at = formattedDate;
                        }
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


        const deleteSong = async (songId) => {
        try {
        await deleteUsersSong(songId);
        
    
        router.push('/');
      } catch (error) {
          console.error('Ошибка загрузки изображения:', error);  
        }
      }


        const fetchComments = async () => {
            try {
                
                const data = await fetchSongsComments(songID);
                console.log(data);
                for (let i = 0; i < data.length; i++) {
                    const date = new Date(data[i].created_at);
            const formattedDate = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} ${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
            data[i].created_at = formattedDate;
        }
                console.log(data);
                comments.value = data;
                console.log(comments);
            } catch (error) {
                console.error(error);
            }
        }

        const addComment = async () => {
            try {
                console.log(newComment.value);
                if (newComment.value != '') {
                    console.log('fhjdsf');
                    const data = await addUsersComment(song.value.id, user.value.id, newComment.value);
                    newComment.value = '';
                    await fetchComments();
                }

            } catch (error) {
                console.error(error);
            }

        }
        const deleteExplComment = async (id) => {
            try {
                await deleteExplanationComment(id);
                const explData = await fetchExplanationComments(selectedExplanation.value.id);
                    for (let i = 0; i < explData.length; i++) {
                        const date = new Date(data[i].created_at);
            const formattedDate = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} ${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
            data[i].created_at = formattedDate;
        }
                    explComments.value = explData;
            } catch (error) {
                console.error(error);
            }
        }

        const deleteSongComment = async (id) => {
            try {
                await deleteCommentOnSong(id);
                await fetchComments();
            } catch (error) {
                console.error(error);
            }
        }

        const setRatingOfSelectedExplanation = async (id, rating) => {
            try {
                console.log('hello');
                await likeDislikeExplanation(id, user.value.id, rating);
                await getRatingOfSelectedExplanation();
            } catch (error) {
                console.error(error);
            }
        }

        const getRatingOfSelectedExplanation = async () => {
            try {
                const data = await fetchExplanationRating(selectedExplanation.value.id);
                selectedExplanationRating.value = data;
                console.log(selectedExplanationRating.value);
            } catch (error) {
                console.error(error);
            }
        }

        const tweakSongData = async () => {
            try {
                await updateSongData(songID, lyricsText.value == '' ? null : lyricsText.value, description.value == '' ? null : description.value,
                 songName.value == '' ? null : songName.value);
                window.location.reload();
            } catch (error) {
                console.error(error);
            }
        }

        const deleteExplanationOnSong = async () => {
            await deleteExplanation(selectedExplanation.value.id);
            clearExplanation();
            await fetch();
        }

        fetchComments();
        fetchRating();
        return {
            deleteExplanationOnSong,
            songName,
            tweakSongData,
            setRatingOfSelectedExplanation,
            getRatingOfSelectedExplanation,
            selectedExplanationRating,
            deleteSong,
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
            songRating,
            deleteSongComment,
            deleteExplComment,
            showForm,
            lyricsText,
            description
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

.explanation_text {
    max-height: 100px;
    overflow-y: scroll;
}
</style>
