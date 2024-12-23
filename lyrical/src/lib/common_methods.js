import { supabase } from "./supaBase";

export async function authenticateUser(email_or_login, p_password) {
  try {
    const { data, error } = await supabase.rpc("authenticate_user", {
      email_or_login,
      p_password,
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
      p_lyrics: lyrics.replace(/\n/g, "<br>\n").replace(/\s\s+/g, ""),
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

export async function deleteCommentOnSong(comment_id) {
  try {
    const { error } = await supabase.rpc("delete_song_comment", {
      p_comment_id: comment_id,
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function deleteExplanationComment(comment_id) {
  try {
    const { error } = await supabase.rpc("delete_explanation_comment", {
      p_expl_comment_id: comment_id,
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function fetchExplanationRating(explanationId) {
  try {
    const { data, error } = await supabase.rpc("fetch_explanation_rating", {
      p_explanation_id: explanationId,
    });

    if (error) {
      throw new Error(error.message);
    }
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function likeDislikeExplanation(explanationId, userId, newValue) {
  try {
    console.log(explanationId, userId, newValue);
    const { error } = await supabase.rpc("add_rating_to_explanation", {
      p_explanation_id: explanationId,
      p_new_rating: newValue,
      p_user_id: userId,
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function fetchUnapprovedSongs() {
  try {
    const { data, error } = await supabase.rpc("fetch_unapproved_songs");
    if (error) {
      throw new Error(error.message);
    }
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function approveSong(songId) {
  try {
    const { error } = await supabase.rpc("approve_song", {
      p_song_id: songId,
    });
    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function fetchUnreviewedExplanations() {
  try {
    const { data, error } = await supabase.rpc("fetch_unapproved_explanations");
    if (error) {
      throw new Error(error.message);
    }
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function approveExplanation(explanationId) {
  try {
    const { error } = await supabase.rpc("approve_explanation", {
      p_explanation_id: explanationId,
    });
    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function deleteExplanation(explanationId) {
  try {
    const { error } = await supabase.rpc("delete_explanation", {
      p_explanation_id: explanationId,
    });
    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function updateSongData(
  songId,
  newLyrics = null,
  newDescription = null,
  newSongName = null
) {
  try {
    const { error } = await supabase.rpc("update_song_data", {
      p_song_id: songId,
      p_lyrics: newLyrics.replace(/\n/g, "<br>\n").replace(/\s\s+/g, ""),
      p_description: newDescription,
      p_song_name: newSongName,
    });
    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function updateUser(
  userId,
  username = null,
  email = null,
  password = null
) {
  try {
    const { error } = await supabase.rpc("update_user", {
      p_user_id: userId,
      new_username: username,
      new_email: email,
      new_password: password,
    });
    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function deleteUser(userId) {
  try {
    console.log(userId);
    const { error } = await supabase.rpc("delete_user", {
      p_user_id: userId,
    });
    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function updateArtist(
  artistId,
  name = null,
  realName = null,
  description = null
) {
  try {
    const { error } = await supabase.rpc("update_artist", {
      p_artist_id: artistId,
      new_name: name,
      new_real_name: realName,
      new_description: description,
    });
    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function deleteArtist(artistId) {
  try {
    const { error } = await supabase.rpc("delete_artist", {
      p_artist_id: artistId,
    });
    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    throw new Error(error.message);
  }
}
