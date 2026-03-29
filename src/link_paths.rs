fn looks_like_windows_absolute_path(dest: &str) -> bool {
    let bytes = dest.as_bytes();
    bytes.len() >= 3
        && bytes[0].is_ascii_alphabetic()
        && bytes[1] == b':'
        && matches!(bytes[2], b'/' | b'\\')
}

fn split_uri_suffix(dest: &str) -> (&str, &str) {
    let query_index = dest.find('?');
    let fragment_index = dest.find('#');
    let split_index = match (query_index, fragment_index) {
        (Some(query), Some(fragment)) => query.min(fragment),
        (Some(query), None) => query,
        (None, Some(fragment)) => fragment,
        (None, None) => dest.len(),
    };

    (&dest[..split_index], &dest[split_index..])
}

fn normalize_bare_local_path_to_file_uri(dest: &str) -> Option<String> {
    let (path, suffix) = split_uri_suffix(dest);

    if path.starts_with('/') && !path.starts_with("//") {
        Some(format!(
            "file://{}{}",
            percent_encode_file_path(path),
            suffix
        ))
    } else if looks_like_windows_absolute_path(path) {
        let normalized = path.replace('\\', "/");
        Some(format!(
            "file://{}{}",
            percent_encode_file_path(&format!("/{normalized}")),
            suffix
        ))
    } else {
        None
    }
}

fn percent_encode_file_path(path: &str) -> String {
    let mut encoded = String::with_capacity(path.len());

    for &byte in path.as_bytes() {
        if matches!(
            byte,
            b'A'..=b'Z'
                | b'a'..=b'z'
                | b'0'..=b'9'
                | b'-'
                | b'.'
                | b'_'
                | b'~'
                | b'/'
                | b':'
                | b'@'
                | b'!'
                | b'$'
                | b'&'
                | b'\''
                | b'('
                | b')'
                | b'*'
                | b'+'
                | b','
                | b';'
                | b'='
        ) {
            encoded.push(byte as char);
        } else {
            encoded.push('%');
            encoded.push(char::from(b"0123456789ABCDEF"[(byte >> 4) as usize]));
            encoded.push(char::from(b"0123456789ABCDEF"[(byte & 0x0F) as usize]));
        }
    }

    encoded
}

fn find_link_destination_bounds(
    text: &str,
    destination_start: usize,
) -> Option<(usize, usize, usize)> {
    let bytes = text.as_bytes();
    if destination_start >= bytes.len() {
        return None;
    }

    if bytes[destination_start] == b'<' {
        let destination_inner_start = destination_start + 1;
        let mut index = destination_inner_start;
        while index < bytes.len() {
            match bytes[index] {
                b'>' if index + 1 < bytes.len() && bytes[index + 1] == b')' => {
                    return Some((destination_inner_start, index, index + 1));
                }
                b'\\' if index + 1 < bytes.len() => index += 2,
                _ => index += 1,
            }
        }
        None
    } else {
        let mut index = destination_start;
        while index < bytes.len() {
            match bytes[index] {
                b')' => return Some((destination_start, index, index)),
                b'\\' if index + 1 < bytes.len() => index += 2,
                _ => index += 1,
            }
        }
        None
    }
}

pub(crate) fn normalize_outgoing_local_markdown_links(text: &str) -> String {
    let bytes = text.as_bytes();
    let mut normalized = String::with_capacity(text.len());
    let mut copy_from = 0;
    let mut index = 0;

    while index < bytes.len() {
        if bytes[index] != b'[' {
            index += 1;
            continue;
        }

        let Some(label_end_rel) = text[index + 1..].find("](") else {
            break;
        };
        let label_end = index + 1 + label_end_rel;
        let destination_start = label_end + 2;
        let Some((destination_inner_start, destination_end, closing_paren)) =
            find_link_destination_bounds(text, destination_start)
        else {
            index += 1;
            continue;
        };
        let destination = &text[destination_inner_start..destination_end];

        if let Some(file_uri) = normalize_bare_local_path_to_file_uri(destination) {
            normalized.push_str(&text[copy_from..destination_inner_start]);
            normalized.push_str(&file_uri);
            copy_from = destination_end;
        }

        index = closing_paren + 1;
    }

    if normalized.is_empty() {
        text.to_owned()
    } else {
        normalized.push_str(&text[copy_from..]);
        normalized
    }
}

#[cfg(test)]
mod tests {
    use super::normalize_outgoing_local_markdown_links;

    #[test]
    fn normalizes_unix_absolute_paths_inside_markdown_links() {
        let input = "[open](/Volumes/Extend/Projects/Writer/_open/test.md)";
        let output = normalize_outgoing_local_markdown_links(input);
        assert_eq!(
            output,
            "[open](file:///Volumes/Extend/Projects/Writer/_open/test.md)"
        );
    }

    #[test]
    fn percent_encodes_spaces_and_non_ascii_in_local_file_links() {
        let input = "[report](/Volumes/Extend/Projects/Writer/시장 분석/report final.md)";
        let output = normalize_outgoing_local_markdown_links(input);
        assert_eq!(
            output,
            "[report](file:///Volumes/Extend/Projects/Writer/%EC%8B%9C%EC%9E%A5%20%EB%B6%84%EC%84%9D/report%20final.md)"
        );
    }

    #[test]
    fn preserves_line_fragments_when_normalizing_local_file_links() {
        let input =
            "[code](/Volumes/Extend/Projects/DevWorkspace/xsfire-camp/src/codex_agent.rs#L257)";
        let output = normalize_outgoing_local_markdown_links(input);
        assert_eq!(
            output,
            "[code](file:///Volumes/Extend/Projects/DevWorkspace/xsfire-camp/src/codex_agent.rs#L257)"
        );
    }

    #[test]
    fn preserves_existing_uris_and_plain_text() {
        let input = concat!(
            "[web](https://example.com)\n",
            "[file](file:///Volumes/Extend/Projects/Writer/_open/test.md)\n",
            "plain /Volumes/Extend/Projects/Writer/_open/test.md"
        );
        let output = normalize_outgoing_local_markdown_links(input);
        assert_eq!(output, input);
    }

    #[test]
    fn normalizes_windows_absolute_paths_and_angle_wrapped_destinations() {
        let input = "[win](<C:\\Users\\g\\Documents\\report final.md>)";
        let output = normalize_outgoing_local_markdown_links(input);
        assert_eq!(
            output,
            "[win](<file:///C:/Users/g/Documents/report%20final.md>)"
        );
    }

    #[test]
    fn preserves_fragments_for_windows_absolute_paths() {
        let input = "[win](<C:\\Users\\g\\Documents\\report final.md#L12>)";
        let output = normalize_outgoing_local_markdown_links(input);
        assert_eq!(
            output,
            "[win](<file:///C:/Users/g/Documents/report%20final.md#L12>)"
        );
    }
}
