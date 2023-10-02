import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";

const ProjectCard = ({ value, index, proc }) => {
	const [updated_at, setUpdatedAt] = useState("0 mints");
	const handleUpdateTime = useCallback(
		(e) => {
			const date = new Date(value.pushed_at);
			const nowdate = new Date();
			const diff = nowdate.getTime() - date.getTime();
			const hours = Math.trunc(diff / 1000 / 60 / 60);

			if (hours < 24) {
				if (hours < 1) return setUpdatedAt("just now");
				const measurement = hours === 1 ? "hour" : "hours";
				return setUpdatedAt(`${hours.toString()} ${measurement} ago`);
			}

			const monthNames = [
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December",
			];
			const day = date.getDate();
			const monthIndex = date.getMonth();
			const year = date.getFullYear();

			return setUpdatedAt(`on ${day} ${monthNames[monthIndex]} ${year}`);
		},
		[value.pushed_at]
	);

	useEffect(() => handleUpdateTime(), [handleUpdateTime]);

	const { name, description, svn_url, stargazers_count, languages_url } = value;
	return (
		<div className={`col-md-6 ${index > 1 ? "d-none d-lg-block" : ""}`}>
			{/* ^sets only two repo cards to display per section on screens smaller than 992px */}
			<div className="card shadow-lg p-3 mb-5 bg-white rounded">
				<div className="card-body">
					<a
						href={svn_url}
						target=" _blank"
						className="text-dark text-decoration-none"
					>
						<h5 className="card-title d-inline-block">{name} </h5>
					</a>
					<p className="card-text">{description} </p>
					<hr />
					<Languages languages_url={languages_url} svn_url={svn_url} proc={proc} />
					<p className="card-text d-flex justify-content-between">
						<a
							href={svn_url + "/stargazers"}
							target=" _blank"
							className="text-dark text-decoration-none"
						>
							<span className="text-dark card-link mr-4">
								<i className="fab fa-github" /> Stars{" "}
								<span className="badge bg-dark">{stargazers_count}</span>
							</span>
						</a>
						<small className="text-muted">Updated {updated_at}</small>
					</p>
				</div>
			</div>
		</div>
	);
};
ProjectCard.propTypes = {
	value: PropTypes.shape({
		name: PropTypes.string.isRequired,
		description: PropTypes.string.isRequired,
		svn_url: PropTypes.string.isRequired,
		stargazers_count: PropTypes.number.isRequired,
		languages_url: PropTypes.string.isRequired,
		pushed_at: PropTypes.string.isRequired,
	}),
	index: PropTypes.number.isRequired,
	proc: PropTypes.object.isRequired,
};

const Languages = ({ languages_url, svn_url, proc }) => {
	const [data, setData] = useState([]);

	async function getLanguages() {
		const res = await proc.request("/language_data", {
			method: "post",
			body: { languages_url },
		});

		if (res.error) {
			console.error(res.error);
			setData({});
		} else {
			setData(res);
		}
	}

	useEffect(() => {
		getLanguages();
	}, []);

	if (!data) return null;
	const array = [];
	let total_count = 0;
	for (const index in data) {
		array.push(index);
		total_count += data[index];
	}

	return (
		<div className="pb-3">
			{array.map((language) => (
				<a
					key={language}
					className="badge bg-light text-dark card-link mr-2 mb-1 ml-0"
					href={svn_url + `/search?l=${language}`}
					target=" _blank"
				>
					{language}: {Math.trunc((data[language] / total_count) * 1000) / 10}%
				</a>
			))}
		</div>
	);
};
Languages.propTypes = {
	languages_url: PropTypes.string.isRequired,
	svn_url: PropTypes.string.isRequired,
	proc: PropTypes.object.isRequired,
};

export default ProjectCard;
