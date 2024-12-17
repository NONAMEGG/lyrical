import { supabase } from "./supaBase";

export async function authenticateUser(email, password) {
  try {
    const { data, error } = await supabase.rpc("authenticate_user", {
      email,
      password,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function signup(email, password, username) {
  try {
    const { data, error } = await supabase.rpc("register_userupd", {
      email: email,
      password: password,
      username: username,
    });
    if (error) throw error;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function searchSongs(searchQuery) {
  const { data, error } = await supabase.rpc("search_songs", {
    search_query: searchQuery,
  });

  if (error) {
    console.error("Error fetching songs:", error);
  } else {
    return data;
  }
}

export async function fetchSongLyrics(songID) {
  const { data, error } = await supabase.rpc("fetch_lyrics", {
    song_id: songID,
  });

  if (error) {
    console.error("Error fetching songs:", error);
  } else {
    return data;
  }
}

export async function uploadExplanation(
  lyricID,
  explanation,
  idxStart,
  idxEnd,
  userID
) {
  try {
    const { error } = await supabase.rpc("add_explanation", {
      lyric_id: lyricID,
      explanation: explanation,
      idx_start: idxStart,
      idx_end: idxEnd,
      added_by: userID,
    });
    if (error) throw error;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function fetchExplanations(songID) {
  const { data, error } = await supabase.rpc("fetch_explanations", {
    lyric_id: songID,
  });

  if (error) {
    throw new Error(error.message);
  } else {
    return data;
  }
}

export async function uploadProfileIcon(file, userId) {
  console.log(file);
  const filePath = `${Date.now()}_${file.name}`;
  try {
    const { data, error } = await supabase.storage
      .from("profile_icons")
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: "3600",
        metadata: { user_id: String(userId) },
      });

    if (error) {
      throw new Error(error.message);
    }
    const newFilePath = `https://wfgqrxoadlatrszkqrlv.supabase.co/storage/v1/object/profile_icons/${data.path}`;
    const { error: updateError } = await supabase.rpc(
      "add_users_profile_icon",
      {
        user_id: userId,
        path: newFilePath,
      }
    );

    if (updateError) {
      throw new Error(error.message);
    }

    return newFilePath;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function fetchAddedSongs(userId) {
  try {
    console.log(userId);
    const { data, error } = await supabase.rpc("fetch_users_songs", {
      user_id: userId,
    });
    console.log(data);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function deleteUsersSong(songId) {
  try {
    console.log(songId);
    const { error } = await supabase.rpc("delete_user_song", {
      p_song_id: songId,
    });
    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function fetchArtists() {
  try {
    const { data, error } = await supabase.rpc("fetch_artists");
    if (error) {
      throw new Error(error.message);
    }
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function addArtist(artistInfo) {
  try {
    const { data, error } = await supabase.rpc("add_artist", {
      p_name: artistInfo.name,
      p_real_name: artistInfo.real_name,
      p_description: artistInfo.description,
    });
    if (error) {
      throw new Error(error.message);
    }
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function addSong(songName, lyrics, description, artistId, userId) {
  try {
    const { data, error } = await supabase.rpc("add_song", {
      p_name: songName,
      p_lyrics: lyrics,
      p_description: description,
      artist_id: artistId,
      user_id: userId,
    });
    if (error) {
      throw new Error(error.message);
    }
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function fetchMostRatedArtists() {
  try {
    const { data, error } = await supabase.rpc("fetch_most_rated_artists");
    if (error) {
      throw new Error(error.message);
    }
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function fetchMostRatedSongs() {
  try {
    const { data, error } = await supabase.rpc("fetch_most_rated_songs");
    if (error) {
      throw new Error(error.message);
    }
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function fetchResentlyAddedSongs() {
  try {
    const { data, error } = await supabase.rpc("get_songs_added_today");
    console.log(data);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function fetchArtist(artistId) {
  try {
    const { data, error } = await supabase.rpc("fetch_artist_info", {
      artist_id: artistId,
    });

    if (error) {
      throw new Error(error.message);
    }
    console.log(data);
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function fetchArtistSongs(artistId) {
  try {
    const { data, error } = await supabase.rpc("fetch_artist_songs", {
      artist_id: artistId,
    });

    if (error) {
      throw new Error(error.message);
    }
    console.log(data);
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function addUsersComment(songId, userId, comment) {
  try {
    console.log(songId);
    const { data, error } = await supabase.rpc("add_comment", {
      p_song_id: songId,
      p_user_id: userId,
      p_text: comment,
    });

    if (error) {
      throw new Error(error.message);
    }
    console.log(data);
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function fetchSongsComments(songId) {
  try {
    console.log(songId);
    const { data, error } = await supabase.rpc("fetch_comments", {
      p_song_id: songId,
    });

    if (error) {
      throw new Error(error.message);
    }
    console.log(data);
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function addExplanationComment(userId, comment, explId) {
  try {
    const { data, error } = await supabase.rpc("add_explanation_comment", {
      p_user_id: userId,
      p_comment: comment,
      p_expl_id: explId,
    });

    if (error) {
      throw new Error(error.message);
    }
    console.log(data);
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function fetchCommentsForExplanation(explId) {
  try {
    const { data, error } = await supabase.rpc("fetch_explanation_comments", {
      p_expl_id: explId,
    });

    if (error) {
      throw new Error(error.message);
    }
    console.log(data);
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function likeDislikeSong(songId, userId) {
  try {
    console.log(songId, userId);
    const { data, error } = await supabase.rpc("add_rating_to_song", {
      p_song_id: songId,
      p_user_id: userId,
    });

    if (error) {
      throw new Error(error.message);
    }
    console.log(`my data ${data}`);
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getSongsRatings(songId) {
  try {
    const { data, error } = await supabase.rpc("fetch_song_rating", {
      p_song_id: songId,
    });

    if (error) {
      throw new Error(error.message);
    }
    console.log(data);
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function likeDislikeArtist(artistId, userId) {
  try {
    const { data, error } = await supabase.rpc("add_rating_to_artist", {
      p_artist_id: artistId,
      p_user_id: userId,
    });

    if (error) {
      throw new Error(error.message);
    }
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getArtistsRatings(artistId) {
  try {
    const { data, error } = await supabase.rpc("fetch_artist_rating", {
      p_artist_id: artistId,
    });

    if (error) {
      throw new Error(error.message);
    }
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}
