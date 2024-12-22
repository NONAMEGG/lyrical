<template>
    <Header></Header>
    <div v-if="unapprovedSongs">
        <div v-for="song in unapprovedSongs" :key="song.id">
            <p @click="showLyricsForSong(song.id)">{{ song.title }}</p>
            <button @click="approveSongClick(song.id)">Подтвердить</button>
            <button @click="deleteSong(song.id)">Удалить</button>
        </div>
    </div>
    <div v-html="songLyrics">
    </div>

    <div v-if="unapprovedExplanations">
        <div v-for="explanation in unapprovedExplanations">
            <p @click="showExplainedLyrics(explanation.id)">{{ explanation.explanation }}</p>
            <button @click="approveExplanationClick(explanation.id)">Подтвердить</button>
            <button @click="deleteExplanationClick(explanation.id)">Удалить</button>
        </div>
    </div>
    <div v-html="songSample"></div>
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
    getSongsRatings,
    deleteCommentOnSong,
    deleteExplanationComment,
    fetchExplanationRating,
    likeDislikeExplanation,
    fetchUnapprovedSongs,
    deleteUsersSong,
    approveSong,
    fetchUnreviewedExplanations,
    deleteExplanation,
    approveExplanation

} from '../lib/common_methods';
import Header from '../components/header.vue';
export default {
    components: {
        Header
    },
    setup () {
        const user = inject('user');
        const isAuthenticated = inject('isAuthenticated');
        const unapprovedSongs = ref([]);
        const songLyrics = ref('');
        const isShowingLyricsFor = ref(0);

        const unapprovedExplanations = ref([]);
        const songSample = ref('');
        const isShowingExplanationFor = ref(0);

        const fetchSongs = async () => {
            try {
            const data = await fetchUnapprovedSongs();
            unapprovedSongs.value = data;
            } catch (error) {
                console.error(error);
            }
        }

        const fetchExplanations = async () => {
            try {
            const data = await fetchUnreviewedExplanations();
            unapprovedExplanations.value = data;
            } catch (error) {
                console.error(error);
            }
        }

        const deleteSong = async (songId) => {
        try {
        await deleteUsersSong(songId);
        const index = unapprovedSongs.value.findIndex(item => item.id === songId);
        if (index !== -1) {
            unapprovedSongs.value.splice(index, 1); 
        await fetchSongs();
      }
      } catch (error) {
          console.error(error);  
        }
      }

      const approveSongClick = async (songId) => {
        try {
            await approveSong(songId);
            await fetchSongs();
        } catch (error) {
            console.error(error);
        }
      }

      const showLyricsForSong = (songId) => {
        if (songId == isShowingLyricsFor.value) {
            songLyrics.value = '';
            isShowingLyricsFor.value = 0;
        }else {
            songLyrics.value = unapprovedSongs.value.find((song) => song.id == songId).lyrics;
            isShowingLyricsFor.value = songId;
        }
      }

      const showExplainedLyrics = (explanationId) => {
        if (explanationId == isShowingExplanationFor.value) {
            songSample.value = '';
            isShowingExplanationFor.value = 0;
        }else {
            songSample.value = unapprovedExplanations.value.find((expl) => expl.id == explanationId).selected_lyrics;
            isShowingExplanationFor.value = explanationId;
        }
      }

      const approveExplanationClick = async (explanationId) => {
        try {
            await approveExplanation(explanationId);
            await fetchExplanations();
        } catch (error) {
            console.error(error);
        }
      }

      const deleteExplanationClick = async (explanationId) => {
        try {
            await deleteExplanation(explanationId);
            await fetchExplanations();
        } catch (error) {
            console.error(error);
        }
      }

        fetchSongs();
        fetchExplanations();
        return {
            deleteExplanationClick,
            approveExplanationClick,
            showExplainedLyrics,
            showLyricsForSong,
            unapprovedSongs,
            deleteSong,
            approveSongClick,
            songLyrics,
            unapprovedExplanations,
            songSample
        }
    }
}

</script>